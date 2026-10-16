// Soubory ke vzpomínkám: fotky, hlasové nahrávky a videa.
// Leží v soukromém úložišti "vzpominky" ve složce pojmenované podle ID rodiče.
// Do aplikace se nikdy nedostane trvalý odkaz, jen odkaz s omezenou platností (1 hodina).

import { useEffect, useState } from 'react';

import { toMessage } from './errors';
import { supabase } from './supabase';

export type MemoryKind = 'dopis' | 'foto' | 'hlas' | 'video';
export type MediaInfo = { path: string; mime: string; size: number; durationMs: number | null };

const BUCKET = 'vzpominky';
/** Stejný limit hlídá i úložiště (50 MB na soubor). */
export const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/gif': 'gif',
  'audio/mp4': 'm4a',
  'audio/m4a': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/aac': 'aac',
  'audio/mpeg': 'mp3',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

const FALLBACK_MIME: Record<Exclude<MemoryKind, 'dopis'>, string> = {
  foto: 'image/jpeg',
  hlas: 'audio/mp4',
  video: 'video/mp4',
};

/** Typ souboru podle přípony, když ho systém neřekne (nahrávky v telefonu). */
function mimeFromUri(uri: string) {
  const ext = uri.split('?')[0].split('.').pop()?.toLowerCase();
  const found = Object.entries(EXTENSIONS).find(([, e]) => e === ext);
  return found?.[0];
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) throw new Error('Nejste přihlášeni.');
  return uid;
}

/** Nahraje soubor (z fotoaparátu, galerie nebo nahrávání) do složky rodiče. */
export async function uploadMedia(
  uri: string,
  kind: Exclude<MemoryKind, 'dopis'>,
  options: { mime?: string | null; durationMs?: number | null } = {},
): Promise<MediaInfo> {
  const uid = await currentUserId();
  const response = await fetch(uri);
  const body = await response.arrayBuffer();
  const rawMime = options.mime || response.headers.get('content-type') || mimeFromUri(uri) || FALLBACK_MIME[kind];
  // "audio/webm;codecs=opus" → "audio/webm"
  const mime = rawMime.split(';')[0].trim().toLowerCase();
  const expected = kind === 'foto' ? 'image/' : kind === 'hlas' ? 'audio/' : 'video/';
  if (!mime.startsWith(expected)) {
    throw new Error(
      kind === 'foto' ? 'Vyberte prosím fotku.' : kind === 'video' ? 'Vyberte prosím video.' : 'Nahrávku nejde uložit.',
    );
  }
  if (body.byteLength > MAX_MEDIA_BYTES) {
    throw new Error('Soubor je větší než 50 MB. Zkuste kratší video nebo menší fotku.');
  }
  const ext = EXTENSIONS[mime] ?? mime.split('/')[1]?.replace(/[^a-z0-9]/g, '') ?? 'bin';
  const random = Math.random().toString(36).slice(2, 10);
  const path = `${uid}/${Date.now()}-${random}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: mime, upsert: false });
  if (error) throw new Error(toMessage(error, 'Soubor se nepodařilo nahrát. Zkuste to prosím znovu.'));
  return { path, mime, size: body.byteLength, durationMs: options.durationMs ?? null };
}

const urlCache = new Map<string, { url: string; expires: number }>();

/** Odkaz na soubor s platností 1 hodina. Cizí soubor úložiště nevydá. */
export async function mediaUrl(path: string): Promise<string> {
  const hit = urlCache.get(path);
  if (hit && hit.expires > Date.now() + 60_000) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error('Soubor se nepodařilo načíst.');
  urlCache.set(path, { url: data.signedUrl, expires: Date.now() + 3600_000 });
  return data.signedUrl;
}

export function useMediaUrl(path: string | null | undefined) {
  const [state, setState] = useState<{ path: string | null; url: string | null; error: string | null }>({
    path: null,
    url: null,
    error: null,
  });
  useEffect(() => {
    if (!path) return;
    let active = true;
    mediaUrl(path)
      .then((url) => active && setState({ path, url, error: null }))
      .catch((e: Error) => active && setState({ path, url: null, error: e.message }));
    return () => {
      active = false;
    };
  }, [path]);
  // Výsledek pro jiný soubor (po výměně) se nepoužije.
  return state.path === path ? state : { path: path ?? null, url: null, error: null };
}

/** Smaže soubor z úložiště. Společné ukázky (demo/) zůstanou, smazat je nejde. */
export async function deleteMedia(path: string | null | undefined) {
  if (!path || path.startsWith('demo/')) return;
  urlCache.delete(path);
  await supabase.storage.from(BUCKET).remove([path]);
}

/** Před smazáním účtu smaže všechny jeho soubory (právo na výmaz). */
export async function deleteAllMyMedia() {
  const uid = await currentUserId();
  for (let round = 0; round < 20; round++) {
    const { data } = await supabase.storage.from(BUCKET).list(uid, { limit: 100 });
    if (!data?.length) return;
    await supabase.storage.from(BUCKET).remove(data.map((f) => `${uid}/${f.name}`));
  }
}

/** Délka nahrávky "1:05". */
export function formatDuration(ms: number | null | undefined) {
  if (!ms || ms < 0) return '0:00';
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export const KIND_LABELS: Record<MemoryKind, string> = {
  dopis: 'Dopis',
  foto: 'Fotka',
  hlas: 'Hlasový vzkaz',
  video: 'Video vzkaz',
};
