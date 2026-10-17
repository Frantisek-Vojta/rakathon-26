// Uložení souboru do zařízení. Na webu se soubor stáhne do složky Stažené,
// v telefonu se otevře nabídka sdílení (save-file.native.ts).

/** Nabídne soubor k uložení pod daným názvem. */
export async function saveFile(name: string, data: Blob | Uint8Array | string, mime: string) {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Prohlížeč si soubor převezme až po kliknutí, adresu proto uvolníme o chvíli později.
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Stáhne soubor z adresy (fotka, nahrávka, video) a nabídne ho k uložení. */
export async function saveFromUrl(url: string, name: string, mime: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Soubor se nepodařilo stáhnout. Zkuste to prosím znovu.');
  await saveFile(name, await response.blob(), mime);
}

/** Obsah souboru z adresy (pro zálohu). */
export async function readUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Soubor se nepodařilo stáhnout. Zkuste to prosím znovu.');
  return new Uint8Array(await response.arrayBuffer());
}
