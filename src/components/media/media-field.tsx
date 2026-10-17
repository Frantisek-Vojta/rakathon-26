import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState, type ComponentProps } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { AudioPlayer } from '@/components/media/audio-player';
import { VideoPlayer } from '@/components/media/video-player';
import { VoiceRecorder } from '@/components/media/voice-recorder';
import { WebCamera, webCameraSupported } from '@/components/media/web-camera';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import {
  deleteMedia,
  MediaRejected,
  mediaUrl,
  uploadMedia,
  useMediaUrl,
  type MediaInfo,
  type MemoryKind,
} from '@/lib/media';
import { saveFromUrl } from '@/lib/save-file';

type MediaKind = Exclude<MemoryKind, 'dopis'>;
type Pending = { uri: string; mime?: string | null; durationMs?: number | null };

type Props = {
  kind: MediaKind;
  media: MediaInfo | null;
  /** Bez onChange se soubor jen zobrazí (režim čtení). */
  onChange?: (media: MediaInfo | null) => void;
  /** Název souboru při stažení, např. „eliska-ukolebavka.m4a“. */
  downloadName?: string;
};

/** Na počítači se soubory vybírají „z počítače“, v telefonu „z galerie“. */
function onComputer() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && !window.matchMedia?.('(pointer: coarse)').matches;
}

/** Fotka, hlasová nahrávka nebo video u vzpomínky: přidání, náhled, výměna, odebrání a stažení. */
export function MediaField({ kind, media, onChange, downloadName }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Nahrávka, kterou se nepodařilo odeslat (výpadek internetu): jde poslat znovu, nic se neztratí.
  const [failed, setFailed] = useState<Pending | null>(null);
  const [camera, setCamera] = useState(false);
  const editable = !!onChange;
  const computer = onComputer();

  async function save({ uri, mime, durationMs }: Pending) {
    setBusy(true);
    setError(null);
    setFailed(null);
    try {
      const info = await uploadMedia(uri, kind, { mime, durationMs });
      const old = media?.path;
      onChange?.(info);
      if (old) deleteMedia(old).catch(() => undefined);
      if (Platform.OS === 'web' && uri.startsWith('blob:')) URL.revokeObjectURL(uri);
    } catch (e) {
      setError((e as Error).message);
      if (!(e instanceof MediaRejected)) setFailed({ uri, mime, durationMs });
    } finally {
      setBusy(false);
    }
  }

  async function pick(source: 'camera' | 'library') {
    setError(null);
    setFailed(null);
    if (source === 'camera' && kind !== 'hlas' && webCameraSupported(kind)) {
      setCamera(true);
      return;
    }
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(
        source === 'camera'
          ? 'Bez přístupu k fotoaparátu to nepůjde. Povolení můžete zapnout v nastavení telefonu.'
          : 'Bez přístupu k fotkám to nepůjde. Povolení můžete zapnout v nastavení telefonu.',
      );
      return;
    }
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: kind === 'foto' ? ['images'] : ['videos'],
      quality: 0.8,
      videoMaxDuration: 180,
      // Video vzkaz se natáčí přední kamerou (jako selfie), fotka zadní.
      cameraType: kind === 'video' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
    };
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    await save({
      uri: asset.uri,
      mime: asset.mimeType,
      durationMs: asset.duration ? Math.round(asset.duration) : null,
    });
  }

  function remove() {
    const old = media?.path;
    onChange?.(null);
    if (old) deleteMedia(old).catch(() => undefined);
  }

  const preview = media ? <MediaPreview kind={kind} media={media} /> : null;

  if (!editable) {
    if (!media) return null;
    return (
      <View style={styles.wrap}>
        {preview}
        {downloadName && <DownloadButton media={media} name={downloadName} />}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {busy ? (
        <View style={styles.busy} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.busyText}>Ukládám, chvilku strpení…</Text>
        </View>
      ) : camera && kind !== 'hlas' ? (
        <WebCamera
          mode={kind}
          onCaptured={(uri, mime, durationMs) => {
            setCamera(false);
            save({ uri, mime, durationMs });
          }}
          onCancel={() => setCamera(false)}
          onUnavailable={() => {
            setCamera(false);
            pick('library');
          }}
        />
      ) : media ? (
        <>
          {preview}
          <View style={styles.actions}>
            {kind === 'hlas' ? (
              <SmallButton icon="mic-outline" label="Nahrát znovu" onPress={remove} />
            ) : (
              <SmallButton
                icon={kind === 'foto' ? 'images-outline' : 'film-outline'}
                label={kind === 'foto' ? 'Vyměnit fotku' : 'Vyměnit video'}
                onPress={() => pick('library')}
              />
            )}
            <SmallButton icon="trash-outline" label="Odebrat" onPress={remove} />
          </View>
        </>
      ) : kind === 'hlas' ? (
        <VoiceRecorder onRecorded={(uri, durationMs) => save({ uri, durationMs })} />
      ) : (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name={kind === 'foto' ? 'image-outline' : 'videocam-outline'}
              size={34}
              color={Colors.primaryText}
            />
          </View>
          <Text style={styles.emptyTitle}>{kind === 'foto' ? 'Přidejte fotku' : 'Natočte video vzkaz'}</Text>
          <Text style={styles.emptyText}>
            {kind === 'foto'
              ? 'Společná chvíle, ke které se dítě může jednou vracet. Pár slov k ní můžete připsat níže.'
              : `Pár slov přímo do kamery, nebo hotové video ${computer ? 'z počítače' : 'z galerie'}. Nejvýš 3 minuty a 50 MB.`}
          </Text>
          <View style={styles.emptyButtons}>
            <BigButton
              icon={kind === 'foto' ? 'camera-outline' : 'videocam-outline'}
              label={kind === 'foto' ? 'Vyfotit' : 'Natočit video'}
              onPress={() => pick('camera')}
              primary
            />
            <BigButton
              icon="images-outline"
              label={computer ? 'Vybrat z počítače' : 'Vybrat z galerie'}
              onPress={() => pick('library')}
            />
          </View>
        </View>
      )}
      {error && (
        <View style={styles.errorBox} accessibilityLiveRegion="polite">
          <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
          <View style={styles.errorTexts}>
            <Text style={styles.errorText}>{error}</Text>
            {failed && !busy && (
              <Pressable
                accessibilityRole="button"
                onPress={() => save(failed)}
                style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
                <Ionicons name="refresh" size={18} color={Colors.primaryText} />
                <Text style={styles.retryText}>Zkusit znovu uložit</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

/** Stažení souboru do zařízení: záloha, přenos do počítače, vytištění fotky. */
function DownloadButton({ media, name }: { media: MediaInfo; name: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');
  async function download() {
    setState('busy');
    try {
      await saveFromUrl(await mediaUrl(media.path), name, media.mime);
      setState('idle');
    } catch {
      setState('error');
    }
  }
  return (
    <View style={styles.downloadRow}>
      <SmallButton
        icon="download-outline"
        label={state === 'busy' ? 'Stahuji…' : 'Stáhnout soubor'}
        onPress={download}
        disabled={state === 'busy'}
      />
      {state === 'error' && (
        <Text style={styles.downloadError} accessibilityLiveRegion="polite">
          Stažení se nepodařilo. Zkuste to prosím znovu.
        </Text>
      )}
    </View>
  );
}

/** Náhled souboru: fotka, přehrávač zvuku, nebo přehrávač videa. */
export function MediaPreview({ kind, media }: { kind: MediaKind; media: MediaInfo }) {
  const { url, error } = useMediaUrl(media.path);
  if (error) {
    return (
      <View style={styles.missing}>
        <Ionicons name="cloud-offline-outline" size={24} color={Colors.textMuted} />
        <Text style={styles.missingText}>{error}</Text>
      </View>
    );
  }
  if (!url) {
    return (
      <View style={[styles.missing, kind === 'foto' && styles.photoFrame]}>
        <ActivityIndicator color={Colors.primary} accessibilityLabel="Načítám" />
      </View>
    );
  }
  if (kind === 'foto') {
    return (
      <Image
        source={{ uri: url }}
        alt="Fotka u vzpomínky"
        accessibilityLabel="Fotka u vzpomínky"
        contentFit="cover"
        transition={250}
        style={[styles.photo, styles.photoFrame]}
      />
    );
  }
  if (kind === 'hlas') return <AudioPlayer url={url} durationMs={media.durationMs} />;
  return <VideoPlayer url={url} />;
}

function BigButton({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.big, primary && styles.bigPrimary, pressed && styles.pressed]}>
      <Ionicons name={icon} size={22} color={primary ? Colors.onPrimary : Colors.heading} />
      <Text style={[styles.bigLabel, primary && styles.bigLabelPrimary]}>{label}</Text>
    </Pressable>
  );
}

function SmallButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.small, pressed && styles.pressed, disabled && styles.disabled]}>
      <Ionicons name={icon} size={18} color={Colors.heading} />
      <Text style={styles.smallLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.sm,
  },
  busy: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 180,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  busyText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.borderStrong,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.heading,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 420,
  },
  emptyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  big: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.primarySoft,
    backgroundColor: Colors.surface,
  },
  bigPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.55,
  },
  bigLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.heading,
  },
  bigLabelPrimary: {
    color: Colors.onPrimary,
  },
  small: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  smallLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.heading,
  },
  downloadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  downloadError: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.danger,
  },
  photo: {
    width: '100%',
  },
  photoFrame: {
    aspectRatio: 4 / 3,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceSoft,
  },
  missing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: 80,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceSoft,
  },
  missingText: {
    flexShrink: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.textMuted,
  },
  errorBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: Colors.dangerSoft,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorTexts: {
    flex: 1,
    gap: Spacing.xs,
  },
  errorText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
  },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 44,
  },
  retryText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryText,
  },
});
