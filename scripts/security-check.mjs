// Bezpečnostní test databáze: ověří, že se jeden rodič nedostane k datům druhého.
//
// Spuštění:  node scripts/security-check.mjs
//
// Test vytvoří dva dočasné demo účty (A a B), zkouší „útoky“ z účtu B na data
// účtu A a nakonec oba účty i s daty smaže. Používá jen veřejný klíč, tedy
// přesně to, co má k dispozici kdokoli, kdo si otevře appku v prohlížeči.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  } catch {
    // .env.local není povinný, proměnné mohou přijít z prostředí.
  }
  return env;
}

const env = loadEnv();
const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('Chybí EXPO_PUBLIC_SUPABASE_URL nebo EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
  process.exit(1);
}

const newClient = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
}

const anonymous = newClient();
const a = newClient();
const b = newClient();

const { data: sa, error: ea } = await a.auth.signInAnonymously();
const { data: sb, error: eb } = await b.auth.signInAnonymously();
if (ea || eb) {
  console.error('Nepodařilo se vytvořit testovací účty:', ea?.message ?? eb?.message);
  process.exit(1);
}
console.log(`Účet A: ${sa.user.id}\nÚčet B: ${sb.user.id}\n`);

try {
  // 1) Demo účet dostal ukázková data
  const { data: childrenA } = await a.from('children').select('id, name').order('created_at');
  const { data: lettersA } = await a.from('letters').select('id, status');
  check('Demo účet A má ukázkové děti', childrenA?.length === 3, childrenA?.map((c) => c.name).join(', '));
  check('Demo účet A má ukázkové vzkazy', (lettersA?.length ?? 0) >= 5, `${lettersA?.length} vzkazů`);
  const childA = childrenA[0];
  const letterA = lettersA[0];

  // 2) B nevidí data A
  const { data: childrenB } = await b.from('children').select('id, owner_id');
  check('B vidí jen svoje děti', childrenB.every((c) => c.owner_id === sb.user.id), `${childrenB.length} dětí`);
  const { data: peek } = await b.from('children').select('*').eq('id', childA.id);
  check('B nepřečte dítě A ani podle přesného ID', peek.length === 0);
  const { data: peekLetter } = await b.from('letters').select('*').eq('id', letterA.id);
  check('B nepřečte vzkaz A ani podle přesného ID', peekLetter.length === 0);

  // 3) B nemůže měnit ani mazat data A
  const { data: upd } = await b.from('children').update({ name: 'Hacknuto' }).eq('id', childA.id).select();
  check('B nepřepíše dítě A', (upd?.length ?? 0) === 0);
  const { data: del } = await b.from('letters').delete().eq('id', letterA.id).select();
  check('B nesmaže vzkaz A', (del?.length ?? 0) === 0);
  const { data: still } = await a.from('letters').select('id').eq('id', letterA.id);
  check('Vzkaz A pořád existuje', still.length === 1);

  // 4) B nemůže „přilepit“ svůj vzkaz k dítěti A
  const { error: fkErr } = await b.from('letters').insert({ child_id: childA.id, body: 'cizí dítě' });
  check('B nepřidá vzkaz k dítěti A', !!fkErr, fkErr?.code);

  // 5) B nemůže podvrhnout vlastníka
  const { error: ownErr } = await b.from('children').insert({ name: 'Podvrh', owner_id: sa.user.id });
  check('B nepodvrhne vlastníka (owner_id)', !!ownErr, ownErr?.code);

  // 6) Nepřihlášený nevidí nic
  const { data: anonData, error: anonErr } = await anonymous.from('letters').select('id');
  check('Nepřihlášený nepřečte žádné vzkazy', !!anonErr || (anonData?.length ?? 0) === 0, anonErr?.code ?? 'prázdné');
  const { error: anonRpc } = await anonymous.rpc('delete_my_account');
  check('Nepřihlášený nemůže volat mazání účtu', !!anonRpc, anonRpc?.code);

  // 7) Databáze hlídá hodnoty
  const { error: badStatus } = await a.from('letters').update({ status: 'smazano' }).eq('id', letterA.id);
  check('Neplatný stav vzkazu odmítnut', !!badStatus, badStatus?.code);
  const { error: longName } = await a.from('children').insert({ name: 'x'.repeat(61) });
  check('Příliš dlouhé jméno odmítnuto', !!longName, longName?.code);
  const { error: emptyName } = await a.from('children').insert({ name: '   ' });
  check('Prázdné jméno odmítnuto', !!emptyName, emptyName?.code);

  // 8) Stav koncept → hotovo nastaví čas dokončení
  const draft = (await a.from('letters').select('id').eq('status', 'koncept').limit(1)).data[0];
  const { data: done } = await a.from('letters').update({ status: 'hotovo' }).eq('id', draft.id).select('finished_at').single();
  check('Dokončení vzkazu nastaví čas dokončení', !!done?.finished_at);
} finally {
  // 9) Smazání účtů (právo na výmaz) smaže i data
  const { error: delA } = await a.rpc('delete_my_account');
  const { error: delB } = await b.rpc('delete_my_account');
  check('Účet A smazán i s daty', !delA, delA?.message);
  check('Účet B smazán i s daty', !delB, delB?.message);
}

console.log(failures === 0 ? '\nVšechny kontroly prošly.' : `\nSelhalo kontrol: ${failures}`);
process.exit(failures === 0 ? 0 : 1);
