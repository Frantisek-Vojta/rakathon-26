// Záloha všech vzpomínek (zadání: „Export – dlouhodobě přenosná data“).
// Jeden soubor ZIP, který nepotřebuje tuto aplikaci ani internet:
//   index.html   kniha vzpomínek, otevře ji jakýkoli prohlížeč (i za dvacet let)
//   vzkazy.txt   všechny texty jako obyčejný text
//   <dítě>/      fotky, hlasové nahrávky a videa každého dítěte
import { strToU8, zipSync, type Zippable } from 'fflate';

import { PAPERS, STICKERS } from '@/constants/choices';
import type { ChildWithCounts, LetterFont, LetterWithChild, Paper, Sticker } from './data';
import { formatAge, formatDate } from './format';
import { formatDuration, KIND_LABELS, mediaUrl, type MemoryKind } from './media';
import { readUrl, saveFile } from './save-file';

const kindOf = (letter: LetterWithChild) => (letter.kind as MemoryKind) ?? 'dopis';

/** „Ukolébavka na dobrou noc“ → „ukolebavka-na-dobrou-noc“ (názvy souborů bez diakritiky fungují všude). */
export function slug(text: string, fallback = 'vzpominka') {
  const clean = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '');
  return clean || fallback;
}

/** Název souboru se vzpomínkou, např. „eliska-ukolebavka-na-dobrou-noc.m4a“. */
export function memoryFileName(childName: string, letter: Pick<LetterWithChild, 'title' | 'kind' | 'media_path'>) {
  const ext = letter.media_path?.split('.').pop() ?? 'bin';
  const kind = (letter.kind as MemoryKind) ?? 'dopis';
  return `${slug(childName, 'dite')}-${slug(letter.title.trim() || KIND_LABELS[kind])}.${ext}`;
}

export function lettersToText(children: ChildWithCounts[], letters: LetterWithChild[], files?: Map<string, string>) {
  const lines: string[] = ['SCHRÁNKA VZPOMÍNEK', `Záloha ze dne ${formatDate(new Date())}`, ''];
  for (const child of children) {
    const own = letters.filter((l) => l.child_id === child.id);
    lines.push('════════════════════════════════', `PRO: ${child.name}`, '════════════════════════════════', '');
    if (own.length === 0) lines.push('(zatím bez vzpomínek)', '');
    for (const letter of own) {
      const kind = kindOf(letter);
      const file = files?.get(letter.id);
      lines.push(
        `■ ${letter.title.trim() || KIND_LABELS[kind]}`,
        [
          kind === 'dopis' ? null : KIND_LABELS[kind],
          letter.status === 'hotovo' ? `Dokončeno ${formatDate(letter.finished_at)}` : 'Koncept',
          letter.occasion,
        ]
          .filter(Boolean)
          .join(' · '),
        ...(file ? [`Soubor: ${file}`] : []),
        '',
        letter.body.trim(),
        '',
        '',
      );
    }
  }
  return lines.join('\n');
}

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase('cs') + text.slice(1);

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const HTML_FONTS: Record<LetterFont, string> = {
  lora: "Georgia, 'Times New Roman', serif",
  nunito: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  caveat: "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive",
};

function memoryHtml(letter: LetterWithChild, file: string | undefined) {
  const kind = kindOf(letter);
  const paper = PAPERS[letter.paper as Paper] ?? PAPERS.bezova;
  const sticker = letter.sticker ? STICKERS[letter.sticker as Sticker]?.emoji : null;
  const meta = [
    kind === 'dopis' ? null : KIND_LABELS[kind],
    letter.media_duration_ms ? formatDuration(letter.media_duration_ms) : null,
    letter.status === 'hotovo' ? `dokončeno ${formatDate(letter.finished_at)}` : 'koncept',
    letter.occasion,
  ].filter(Boolean);
  const src = file ? escape(encodeURI(file)) : null;
  const media = !src
    ? ''
    : kind === 'foto'
      ? `<img src="${src}" alt="${escape(letter.title || 'Fotka')}">`
      : kind === 'hlas'
        ? `<audio controls preload="metadata" src="${src}"></audio>`
        : `<video controls preload="metadata" src="${src}"></video>`;
  return `
    <article style="background:${paper.color};border-color:${paper.edge}">
      ${sticker ? `<span class="sticker" aria-hidden="true">${sticker}</span>` : ''}
      <h3>${escape(letter.title.trim() || KIND_LABELS[kind])}</h3>
      <p class="meta">${escape(capitalize(meta.join(' · ')))}</p>
      ${media}
      ${letter.body.trim() ? `<p class="body" style="font-family:${HTML_FONTS[letter.font as LetterFont] ?? HTML_FONTS.lora}">${escape(letter.body.trim())}</p>` : ''}
      ${src ? `<p class="file"><a href="${src}">Otevřít soubor</a></p>` : ''}
    </article>`;
}

function bookHtml(children: ChildWithCounts[], letters: LetterWithChild[], files: Map<string, string>) {
  const sections = children
    .map((child, i) => {
      const own = letters.filter((l) => l.child_id === child.id);
      const age = formatAge(child.birth_date);
      return `
  <section id="dite-${i + 1}">
    <h2>Pro: ${escape(child.name)}</h2>
    ${age || child.description ? `<p class="meta">${escape([age, child.description].filter(Boolean).join(' · '))}</p>` : ''}
    ${own.length ? own.map((l) => memoryHtml(l, files.get(l.id))).join('') : '<p class="meta">Zatím bez vzpomínek.</p>'}
  </section>`;
    })
    .join('');
  const nav = children.map((c, i) => `<a href="#dite-${i + 1}">${escape(c.name)}</a>`).join(' · ');
  return `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Schránka vzpomínek</title>
<style>
  body { margin: 0; background: #FCF7F2; color: #4A3B38; font: 17px/1.6 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 64px; }
  h1, h2, h3 { font-family: Georgia, 'Times New Roman', serif; color: #7A2E2E; line-height: 1.25; }
  h1 { font-size: 2em; margin: 0 0 8px; }
  h2 { font-size: 1.5em; margin: 48px 0 8px; }
  h3 { font-size: 1.2em; margin: 0 0 4px; padding-right: 40px; }
  .meta { color: #6F5E59; font-size: 15px; margin: 0 0 12px; }
  nav { margin: 16px 0 0; }
  a { color: #94473F; font-weight: 700; }
  article { position: relative; border: 1px solid; border-radius: 16px; padding: 20px; margin: 16px 0; }
  .sticker { position: absolute; top: 14px; right: 16px; font-size: 24px; }
  .body { white-space: pre-wrap; font-size: 18px; line-height: 1.7; margin: 12px 0 0; }
  img, video { display: block; width: 100%; border-radius: 12px; background: #FBEFEA; }
  audio { width: 100%; }
  .file { font-size: 15px; margin: 8px 0 0; }
  footer { margin-top: 48px; color: #6F5E59; font-size: 15px; }
</style>
</head>
<body>
<main>
  <h1>Schránka vzpomínek</h1>
  <p class="meta">Záloha ze dne ${formatDate(new Date())}. Tato stránka nepotřebuje internet ani aplikaci. Fotky, nahrávky a videa jsou ve složkách vedle ní.</p>
  <nav>${nav}</nav>
  ${sections}
  <footer>„Technologie nenahrazuje vztah, ale může ho pomoci uchovat.“</footer>
</main>
</body>
</html>
`;
}

/** Připraví zálohu a nabídne ji k uložení. Soubory se stahují postupně, průběh hlásí onProgress. */
export async function exportBackup(
  children: ChildWithCounts[],
  letters: LetterWithChild[],
  onProgress?: (done: number, total: number) => void,
) {
  const root = `schranka-vzpominek-${new Date().toISOString().slice(0, 10)}`;
  const zip: Zippable = {};
  const files = new Map<string, string>();
  const used = new Set<string>();
  const withMedia = letters.filter((l) => l.media_path && children.some((c) => c.id === l.child_id));

  for (const letter of withMedia) {
    const child = children.find((c) => c.id === letter.child_id)!;
    const folder = slug(child.name, 'dite');
    const base = memoryFileName(child.name, letter).replace(`${folder}-`, '');
    let name = `${folder}/${base}`;
    for (let n = 2; used.has(name); n++) name = `${folder}/${base.replace(/(\.[^.]+)$/, `-${n}$1`)}`;
    used.add(name);
    files.set(letter.id, name);
  }

  let done = 0;
  onProgress?.(done, withMedia.length);
  for (const letter of withMedia) {
    const bytes = await readUrl(await mediaUrl(letter.media_path!));
    // Fotky a videa už jsou zkomprimované, ukládáme je beze změny (rychlejší).
    zip[`${root}/${files.get(letter.id)}`] = [bytes, { level: 0 }];
    onProgress?.(++done, withMedia.length);
  }
  zip[`${root}/index.html`] = strToU8(bookHtml(children, letters, files));
  zip[`${root}/vzkazy.txt`] = strToU8(lettersToText(children, letters, files));

  await saveFile(`${root}.zip`, zipSync(zip, { level: 6 }), 'application/zip');
}
