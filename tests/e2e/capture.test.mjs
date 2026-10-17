// Počítač: video vzkaz a fotka z webkamery, diktování dopisu hlasem, stažení souboru a záloha všeho.
// Firefox v testu má testovací kameru a mikrofon. Diktování (Web Speech API) Firefox neumí,
// proto ho v testu nahrazuje jednoduchá napodobenina, která „slyší“ pevnou větu.
import { open, check, failed } from './lib.mjs';
const base = process.env.BASE_URL || 'http://localhost:8765';
const b = await open(base, { w: 1280, h: 860 });

// Stažené soubory zachytíme: místo uložení na disk si zapamatujeme název, velikost a obsah.
await b.page.evaluateOnNewDocument(() => {
  window.__downloads = [];
  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (!this.download) return click.call(this);
    const entry = { name: this.download, size: 0, head: '', names: [], done: false };
    window.__downloads.push(entry);
    fetch(this.href)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        const bytes = new Uint8Array(buf);
        entry.size = bytes.byteLength;
        entry.head = String.fromCharCode(...bytes.slice(0, 4));
        let text = '';
        for (let i = 0; i < bytes.length; i += 65536) text += String.fromCharCode(...bytes.slice(i, i + 65536));
        entry.names = [...new Set(text.match(/schranka-vzpominek-[\d-]+\/[\w/.-]+/g) ?? [])];
        entry.done = true;
      });
  };

  class FakeRecognition {
    start() {
      setTimeout(() => this.emit('dobrý den', false), 300);
      setTimeout(() => this.emit('dobrý den moje milá', true), 3000);
    }
    emit(text, isFinal) {
      const result = Object.assign([{ transcript: text }], { isFinal });
      this.onresult?.({ resultIndex: 0, results: [result] });
    }
    stop() {
      setTimeout(() => this.onend?.(), 50);
    }
    abort() {
      this.stop();
    }
  }
  window.webkitSpeechRecognition = FakeRecognition;
});

/** Klikne na viditelné tlačítko s přesně tímto textem (stejný text může být i na skryté obrazovce). */
async function press(text, timeout = 10000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const clicked = await b.page.evaluate((t) => {
      // Ikony jsou znaky písma (soukromá oblast Unicode), do textu tlačítka je nepočítáme.
      const label = (el) =>
        el.innerText
          .replace(/[\uE000-\uF8FF]/g, '')
          .trim()
          .split('\n')[0]
          .trim();
      const buttons = [...document.querySelectorAll('[role="button"], [role="link"]')].filter(
        (el) => label(el) === t && el.offsetParent !== null && el.getAttribute('aria-disabled') !== 'true',
      );
      const el = buttons[buttons.length - 1];
      if (!el) return false;
      el.click();
      return true;
    }, text);
    if (clicked) return true;
    await b.sleep(250);
  }
  throw new Error(`Tlačítko „${text}“ se neobjevilo`);
}

const lastDownload = async (timeout = 30000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const d = await b.page.evaluate(() => window.__downloads.at(-1));
    if (d?.done) return d;
    await b.sleep(300);
  }
  return null;
};

try {
  await b.startDemo();

  // Video vzkaz z webkamery
  await b.go('/deti');
  await b.click('Aneta');
  await press('Natočit video');
  check('Editor videa', await b.hasText('Natočte video vzkaz'));
  await press('Natočit video');
  check('Zapne se náhled kamery', await b.hasText('Začít natáčet', 10000));
  await b.sleep(1200);
  check(
    'Náhled ukazuje obraz z kamery',
    await b.page.evaluate(() => [...document.querySelectorAll('video')].some((v) => !!v.srcObject)),
  );
  await b.shot('50-kamera');
  await press('Začít natáčet');
  check('Natáčení běží', await b.hasText('Natáčím', 5000));
  await b.sleep(3500);
  await b.shot('51-natacim');
  await press('Zastavit natáčení');
  check(
    'Natočené video se uložilo a jde přehrát',
    !!(await b.page
      .waitForFunction(() => [...document.querySelectorAll('video')].some((v) => v.src && v.src.includes('supabase')), {
        timeout: 30000,
      })
      .catch(() => null)),
  );
  check(
    'Kamera se po natočení vypnula',
    await b.page.evaluate(() => ![...document.querySelectorAll('video')].some((v) => v.srcObject?.active)),
  );
  await press('Uložit vzkaz');
  check('Video vzkaz uložen', await b.hasText('Malý krok s velkým významem', 10000));
  await press('Zobrazit vzpomínku');
  await press('Stáhnout soubor');
  const video = await lastDownload();
  check(
    'Video jde stáhnout do počítače',
    !!video && /^aneta-video-vzkaz\.(webm|mp4)$/.test(video.name) && video.size > 10_000,
    video ? `${video.name}, ${video.size} B` : 'nic se nestáhlo',
  );

  // Fotka z webkamery
  await b.go('/deti');
  await b.click('Matěj');
  await press('Přidat fotku');
  await press('Vyfotit');
  check('Zapne se náhled pro fotku', await b.hasText('Až budete připraveni', 10000));
  await b.sleep(1500);
  await press('Vyfotit');
  check(
    'Fotka z kamery se nahrála',
    !!(await b.page
      .waitForFunction(
        () =>
          [...document.querySelectorAll('img[alt="Fotka u vzpomínky"]')].some((i) => i.complete && i.naturalWidth > 0),
        { timeout: 30000 },
      )
      .catch(() => null)),
  );
  await b.shot('52-fotka-z-kamery');
  await press('Uložit koncept');
  check('Fotka uložena jako koncept', await b.hasText('Koncept je uložený', 10000));

  // Diktování dopisu
  await b.go('/deti');
  await b.click('Eliška');
  await press('Napsat dopis');
  check('V editoru je tlačítko Diktovat', await b.hasText('Diktovat hlasem'));
  await press('Diktovat hlasem');
  check(
    'Diktování ukazuje průběžný text',
    !!(await b.page
      .waitForFunction(() => document.body.innerText.includes('dobrý den…'), { timeout: 5000 })
      .catch(() => null)),
  );
  check(
    'Nadiktovaný text se zapsal do dopisu',
    !!(await b.page
      .waitForFunction(
        () => document.querySelector('textarea[aria-label="Text dopisu"]')?.value === 'Dobrý den moje milá',
        { timeout: 8000 },
      )
      .catch(() => null)),
  );
  await b.shot('53-diktovani');
  await press('Zastavit diktování');
  check('Diktování jde zastavit', await b.hasText('Diktovat hlasem', 5000));
  await press('Smazat vzkaz');
  await press('Ano, smazat');
  check('Nadiktovaný dopis jde smazat', await b.hasText('Vytvořit novou vzpomínku', 10000));

  // Záloha všeho
  await b.go('/spravce');
  await press('Stáhnout zálohu');
  check('Záloha se připraví', await b.hasText('Záloha je připravená', 40000));
  const zip = await lastDownload();
  const names = zip?.names ?? [];
  check(
    'Záloha je soubor ZIP',
    !!zip && /^schranka-vzpominek-\d{4}-\d\d-\d\d\.zip$/.test(zip.name) && zip.head === 'PK\u0003\u0004',
  );
  check(
    'V záloze je kniha vzpomínek a texty',
    names.some((n) => n.endsWith('/index.html')) && names.some((n) => n.endsWith('/vzkazy.txt')),
  );
  check(
    'V záloze jsou fotky, nahrávky i videa',
    names.some((n) => n.endsWith('eliska/ukolebavka-na-dobrou-noc.m4a')) &&
      names.some((n) => n.endsWith('matej/nase-louka.jpg')) &&
      names.some((n) => n.endsWith('aneta/video-k-tvym-narozeninam.mp4')),
    `${names.length} souborů, ${zip?.size ?? 0} B`,
  );
  await b.shot('54-zaloha');

  await b.endDemo();
  check('Demo ukončeno', await b.hasText('Vyzkoušet demo', 15000));
} finally {
  console.log(b.logs.length ? b.logs.slice(0, 12).join('\n') : 'konzole bez chyb');
  await b.close();
}
process.exit(failed() ? 1 : 0);
