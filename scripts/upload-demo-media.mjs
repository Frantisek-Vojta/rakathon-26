// Nahraje ukázková média (fotka, ukolébavka, video) do úložiště, složka demo/.
// Demo účty je smějí jen číst (pravidla úložiště v supabase/migrations).
// Potřebuje tajný klíč SUPABASE_SERVICE_ROLE_KEY v .env.local (nikdy ho nedávejte do aplikace).
//
// Spuštění:  node scripts/upload-demo-media.mjs

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = { ...process.env };
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !env[m[1]]) env[m[1]] = m[2];
}
const admin = createClient(env.EXPO_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const FILES = [
  ['foto-louka.jpg', 'image/jpeg'],
  ['ukolebavka.m4a', 'audio/mp4'],
  ['video-narozeniny.mp4', 'video/mp4'],
];

for (const [name, type] of FILES) {
  const body = readFileSync(new URL(`../supabase/demo-media/${name}`, import.meta.url));
  const { error } = await admin.storage.from('vzpominky').upload(`demo/${name}`, body, { contentType: type, upsert: true });
  console.log(error ? `❌ ${name}: ${error.message}` : `✅ demo/${name} (${Math.round(body.length / 1024)} kB)`);
}
