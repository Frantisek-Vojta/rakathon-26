// Kamera přímo v okně aplikace pro web na počítači: náhled z webkamery, fotka nebo video vzkaz.
// Na telefonu a tabletu se místo ní otevře fotoaparát systému (je lepší a lidé ho znají).
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { formatDuration } from '@/lib/media';

import type { WebCameraProps } from './web-camera';

/** Stejný limit jako u videa z galerie. */
const MAX_VIDEO_MS = 3 * 60 * 1000;

/** MP4 přehraje každý telefon, WebM jen některé. Proto MP4, když ho prohlížeč umí natočit. */
const VIDEO_TYPES = [
  'video/mp4;codecs=avc1,mp4a',
  'video/mp4',
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

export function webCameraSupported(mode: 'foto' | 'video' = 'foto') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (!navigator.mediaDevices?.getUserMedia) return false;
  if (mode === 'video' && typeof MediaRecorder === 'undefined') return false;
  // Jen počítač. Telefon a tablet (hlavní ovládání prstem) otevřou svůj fotoaparát.
  return !window.matchMedia?.('(pointer: coarse)').matches;
}

export function WebCamera({ mode, onCaptured, onCancel, onUnavailable }: WebCameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const wrapRef = useRef<ComponentRef<typeof View> | null>(null);
  const [phase, setPhase] = useState<'starting' | 'ready' | 'recording' | 'failed'>('starting');
  const [elapsed, setElapsed] = useState(0);

  // Kamera se otevře uprostřed obrazovky, aby bylo vidět náhled i tlačítko.
  useEffect(() => {
    const node = wrapRef.current as unknown as HTMLElement | null;
    node?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }, []);

  // Kamera běží jen po dobu, kdy je náhled na obrazovce. Při odchodu se vždy vypne.
  useEffect(() => {
    let active = true;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: mode === 'video',
      })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play().catch(() => undefined);
        }
        setPhase('ready');
      })
      .catch(() => {
        if (active) setPhase('failed');
      });
    return () => {
      active = false;
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        // Odchod uprostřed natáčení: nahrávku zahodíme, nic se neuloží.
        recorder.onstop = null;
        recorder.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [mode]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const started = Date.now();
    const timer = setInterval(() => {
      const ms = Date.now() - started;
      setElapsed(ms);
      // Pojistka: po třech minutách se natáčení samo zastaví a video se uloží.
      if (ms >= MAX_VIDEO_MS && recorderRef.current?.state === 'recording') recorderRef.current.stop();
    }, 250);
    return () => clearInterval(timer);
  }, [phase]);

  function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    // Stejný výřez jako náhled: 4 : 3 ze středu obrazu.
    const { videoWidth: w, videoHeight: h } = video;
    const sw = Math.min(w, Math.round((h * 4) / 3));
    const sh = Math.min(h, Math.round((w * 3) / 4));
    const canvas = document.createElement('canvas');
    canvas.width = sw;
    canvas.height = sh;
    canvas.getContext('2d')?.drawImage(video, (w - sw) / 2, (h - sh) / 2, sw, sh, 0, 0, sw, sh);
    canvas.toBlob((blob) => blob && onCaptured(URL.createObjectURL(blob), 'image/jpeg', null), 'image/jpeg', 0.9);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const type = VIDEO_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    let recorder: MediaRecorder;
    try {
      // Nižší datový tok, aby se tři minuty vešly do limitu 50 MB.
      recorder = new MediaRecorder(stream, {
        mimeType: type,
        videoBitsPerSecond: 1_500_000,
        audioBitsPerSecond: 96_000,
      });
    } catch {
      setPhase('failed');
      return;
    }
    const chunks: Blob[] = [];
    const started = Date.now();
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const mime = recorder.mimeType || type || 'video/webm';
      const blob = new Blob(chunks, { type: mime.split(';')[0] });
      onCaptured(URL.createObjectURL(blob), mime, Date.now() - started);
    };
    recorder.start(1000);
    recorderRef.current = recorder;
    setElapsed(0);
    setPhase('recording');
  }

  if (phase === 'failed') {
    return (
      <View style={styles.failed} accessibilityLiveRegion="polite">
        <Ionicons name="videocam-off-outline" size={28} color={Colors.textMuted} />
        <Text style={styles.failedText}>
          Kameru se nepodařilo zapnout. Zkontrolujte, jestli je připojená a jestli k ní prohlížeč smí. Můžete také
          vybrat hotový soubor z počítače.
        </Text>
        <View style={styles.row}>
          <SmallButton icon="folder-open-outline" label="Vybrat z počítače" onPress={onUnavailable} />
          <SmallButton icon="arrow-back" label="Zpět" onPress={onCancel} />
        </View>
      </View>
    );
  }

  const recording = phase === 'recording';

  return (
    <View ref={wrapRef} style={styles.wrap}>
      <View style={[styles.frame, mode === 'video' ? styles.frameVideo : styles.framePhoto]}>
        <video ref={videoRef} muted playsInline autoPlay aria-hidden style={videoStyle} />
        {phase === 'starting' && (
          <View style={styles.overlay}>
            <ActivityIndicator color={Colors.onPrimary} />
            <Text style={styles.overlayText}>Zapínám kameru…</Text>
          </View>
        )}
        {recording && (
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>Natáčím {formatDuration(elapsed)} / 3:00</Text>
          </View>
        )}
        {/* Tlačítko leží přímo na náhledu jako ve fotoaparátu, takže je vždy vidět. */}
        <View style={styles.controls}>
          {mode === 'foto' ? (
            <RoundButton icon="camera" label="Vyfotit" onPress={takePhoto} disabled={phase !== 'ready'} />
          ) : recording ? (
            <RoundButton icon="stop" label="Zastavit natáčení" danger onPress={() => recorderRef.current?.stop()} />
          ) : (
            <RoundButton
              icon="radio-button-on"
              label="Začít natáčet"
              danger
              onPress={startRecording}
              disabled={phase !== 'ready'}
            />
          )}
        </View>
      </View>

      <Text style={styles.hint}>
        {recording
          ? 'Až budete hotovi, klepněte na Zastavit. Video se uloží samo.'
          : mode === 'video'
            ? 'Mluvte klidně, jako byste si spolu povídali. Nejvýš 3 minuty.'
            : 'Až budete připraveni, klepněte na Vyfotit.'}
      </Text>

      {!recording && (
        <Pressable
          accessibilityRole="button"
          onPress={onCancel}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
          <Text style={styles.cancelText}>Zrušit</Text>
        </Pressable>
      )}
    </View>
  );
}

// Náhled je zrcadlový jako v zrcadle. Uložená fotka i video jsou nezrcadlené.
const videoStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transform: 'scaleX(-1)',
} as const;

function RoundButton({
  icon,
  label,
  onPress,
  danger,
  disabled,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.roundWrap, pressed && styles.pressed, disabled && styles.disabled]}>
      <View style={[styles.round, danger && styles.roundDanger]}>
        <Ionicons name={icon} size={30} color={Colors.onPrimary} />
      </View>
      <Text style={styles.roundLabel}>{label}</Text>
    </Pressable>
  );
}

function SmallButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.small, pressed && styles.pressed]}>
      <Ionicons name={icon} size={18} color={Colors.heading} />
      <Text style={styles.smallLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  frame: {
    width: '100%',
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: '#2B2321',
  },
  // Video se natáčí na šířku (16 : 9), fotka má výřez 4 : 3 jako ostatní fotky v aplikaci.
  frameVideo: {
    aspectRatio: 16 / 9,
    maxWidth: 640,
  },
  framePhoto: {
    aspectRatio: 4 / 3,
    maxWidth: 520,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  overlayText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.onPrimary,
  },
  badge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(43, 35, 33, 0.72)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A4E',
  },
  badgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.onPrimary,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(43, 35, 33, 0.5)',
  },
  roundWrap: {
    alignItems: 'center',
    gap: 6,
  },
  round: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.onPrimary,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundDanger: {
    backgroundColor: Colors.danger,
  },
  roundLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.onPrimary,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 420,
  },
  cancel: {
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 15,
    color: Colors.primaryText,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  failed: {
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceSoft,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  failedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    textAlign: 'center',
    maxWidth: 460,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
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
});
