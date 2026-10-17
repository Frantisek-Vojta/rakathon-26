// V telefonu se soubor uloží do dočasné složky aplikace a otevře se nabídka sdílení:
// Uložit do Souborů, do Fotek, poslat e-mailem, na Disk Google…
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

async function share(file: File, name: string, mime: string) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Tento telefon neumí soubor nabídnout k uložení.');
  await Sharing.shareAsync(file.uri, { mimeType: mime, dialogTitle: name });
}

function target(name: string) {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  return file;
}

/** Nabídne soubor k uložení pod daným názvem. */
export async function saveFile(name: string, data: Blob | Uint8Array | string, mime: string) {
  const file = target(name);
  file.create();
  await file.write(typeof data === 'string' || data instanceof Uint8Array ? data : await data.arrayBuffer());
  await share(file, name, mime);
}

/** Stáhne soubor z adresy (fotka, nahrávka, video) a nabídne ho k uložení. */
export async function saveFromUrl(url: string, name: string, mime: string) {
  const file = await File.downloadFileAsync(url, target(name));
  await share(file, name, mime);
}

/** Obsah souboru z adresy (pro zálohu). */
export async function readUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Soubor se nepodařilo stáhnout. Zkuste to prosím znovu.');
  return new Uint8Array(await response.arrayBuffer());
}
