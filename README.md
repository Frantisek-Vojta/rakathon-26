# Schránka vzpomínek

> **Místo pro slova, která mohou zůstat nablízku.**
> Mobilní aplikace, ve které rodič uchová dopisy a vzkazy pro své děti. Je určená hlavně
> rodičům se závažným onemocněním, ale může ji použít každý.

Prototyp z **Rakathonu 2026 (Brno)**, výzva **„Vzkazy pro budoucnost“**.

| | |
|---|---|
| 🌐 **Webová verze** | https://rakathon-vzpominky.vercel.app |
| 📱 **Telefon** | Expo Go (návod níže) |
| 🧪 **Vyzkoušení bez registrace** | tlačítko **„Vyzkoušet demo“** (fiktivní rodina Eliška, Matěj, Aneta) |

---

## Obsah

1. [Co aplikace umí](#1-co-aplikace-umí)
2. [Jak splňujeme zadání](#2-jak-splňujeme-zadání)
3. [Vyzkoušení](#3-vyzkoušení)
4. [Jak aplikace funguje (pro laiky)](#4-jak-aplikace-funguje-pro-laiky)
5. [Technologie](#5-technologie)
6. [Struktura projektu](#6-struktura-projektu)
7. [Datový model](#7-datový-model)
8. [Bezpečnost a ochrana dat](#8-bezpečnost-a-ochrana-dat)
9. [Co se ukládá v zařízení (localStorage)](#9-co-se-ukládá-v-zařízení-localstorage)
10. [Spuštění pro vývojáře](#10-spuštění-pro-vývojáře)
11. [Testy](#11-testy)
12. [UI/UX: přístupnost a responzivita](#12-uiux-přístupnost-a-responzivita)
13. [Nasazení](#13-nasazení)
14. [Co dál](#14-co-dál)

---

## 1. Co aplikace umí

**Hlavní průchod:** vybrat dítě → napsat dopis → uložit → upravit → znovu najít.

| Obrazovka | Co na ní rodič najde |
|---|---|
| **Přihlášení** | Přihlášení e-mailem, registrace, nebo **„Vyzkoušet demo“** jedním klepnutím |
| **Uvítací průvodce** (jen poprvé) | **Vítejte** → **Co je pro vás důležité?** → **Jakou podporu si přejete?** (jemné vedení / klidný režim) → **Připomenutí** (jen když o ně stojíte). Dá se přeskočit, vše jde později změnit |
| **Místo pro slova** (domů) | **Vítejte zpět**, **Kolik máte dnes sil?** (*Mám sílu tvořit* / *Zvládnu jen jednu větu* / *Dnes potřebuji odpočívat*), pokračování v konceptu, jen si vše projít, citát dne |
| **Moje děti** | Karty dětí s věkem a počtem hotových vzkazů a konceptů, přidání dítěte |
| **Profil dítěte** | Jméno, věk, popis, „Napsat dopis“, přepínač **Vzkazy / Časová osa**. Časová osa ukazuje milníky (škola, 18. narozeniny, maturita, svatba…) a u každého, jestli je vzkaz hotový, rozepsaný, nebo ho jde napsat |
| **Dopis** | Psaní na dopisní papír. Volba papíru, písma (i ručně psaného), nálepky a příležitosti. Průběžné ukládání, **Uložit koncept** (jemné potvrzení bez přerušení), **Uložit vzkaz** (poděkování s ilustrací), režim čtení |
| **Inspirace a tipy** | **Proč to má smysl**, **Moje životní příběhy** (5 témat), 22 otázek v 5 tématech (klepnutím začne nový dopis), **Nemusí to být jen v aplikaci** (9 nápadů na vzpomínkové dary) |
| **Správce schránky** | Přehled všech vzkazů, hledání, filtr podle stavu a dítěte, **export do souboru**, **nastavení podpory a připomínek**, informace o ochraně dat, účet, smazání účtu |

**Nad rámec povinného MVP:** uvítací průvodce, jemné vedení / klidný režim, připomínky v telefonu,
průvodce energií, časová osa dítěte, životní příběhy, inspirace, export, místní záloha při
výpadku internetu, demo účet, smazání účtu, plně responzivní rozvržení a přístupnost podle WCAG.

### Podle nových podkladů k výzvě

| Podklad | Jak ho appka naplňuje |
|---|---|
| **Přívětivý začátek i návrat** | Uvítací průvodce a domovská obrazovka „Vítejte zpět“: pokračovat v konceptu, malý podnět, nebo jen prohlížet. Bez výčitek |
| **Vlastní tempo** | Průvodce energií: delší tvorba, jediná věta, nebo odpočinek a inspirace. Rozpracovaný text se nikdy neztratí |
| **Bezpečí a kontrola** | Rodič sám volí míru podpory a připomínky a může je kdykoli vypnout. Ve Správci je srozumitelně popsané, kdo k obsahu má přístup |
| **Jemná gamifikace** | Jen laskavé poděkování po uložení a orientační počet („Už 5 vzpomínek!“). Žádné série, žebříčky ani odpočty. V klidném režimu vypnuto |
| **Připomínky podle přání** | Zapínají se až po volbě uživatele (1× nebo 3× týdně, nebo vůbec). Text na zamčené obrazovce neprozradí obsah: „Možná je dnes hezký okamžik na malou vzpomínku.“ |
| **Časová osa dítěte, Moje životní příběhy, Mimo aplikaci, Proč to má smysl** | Samostatné části aplikace, obsahově podle podkladů |
| **Mapa vzpomínek** | Zatím ne, viz [Co dál](#14-co-dál). Běžný seznam je ve Správci schránky |

---

## 2. Jak splňujeme zadání

### Akceptační kritéria (slide 15 zadání)

| # | Krok ze zadání | Kde v aplikaci | Ověřeno testem |
|---|---|---|---|
| 1 | Otevřete profil fiktivního dítěte (Eliška) | Moje děti → Eliška | ✅ `letters.test.mjs` |
| 2 | Napište dopis a uložte jej jako koncept | Profil → **Napsat dopis** → **Uložit koncept** | ✅ |
| 3 | Koncept znovu otevřete, upravte a dokončete | Profil → Rozepsané → dopis → **Uložit vzkaz** | ✅ |
| 4 | Najděte hotový dopis v přehledu a otevřete jej | Profil → Hotové, nebo **Správce schránky** | ✅ |
| 5 | Restartujte demo: uložený dopis stále existuje | Zavřít a znovu otevřít appku / obnovit stránku | ✅ |

### Povinné funkce MVP (slidy 8 a 14)

| Požadavek | Stav |
|---|---|
| Profil dítěte (alespoň jedno fiktivní dítě) | ✅ Eliška, Matěj, Aneta v demu + přidání vlastních |
| Textový dopis: vytvořit, otevřít, upravit | ✅ |
| Stav koncept / hotové | ✅ štítky „Koncept“ a „Hotové“, přepínání oběma směry |
| Přehled: zobrazit a znovu otevřít uložené vzkazy | ✅ profil dítěte + Správce schránky |
| Zachování dat po restartu | ✅ databáze Supabase + přihlášení uložené v zařízení |
| Spustitelné demo na telefonu | ✅ Expo Go (Android i iPhone) + web |
| Funkční průchod webem | ✅ https://rakathon-vzpominky.vercel.app |
| Návrh bezpečného ukládání dat | ✅ [kapitola 8](#8-bezpečnost-a-ochrana-dat) |

### Principy návrhu (slide 5) a etika (slide 13)

| Princip | Jak ho naplňujeme |
|---|---|
| **Laskavá**: bez nátlaku a hodnocení | Žádné odpočty, série ani „splněno na X %“. Připomínky jen na přání. Texty typu „Není potřeba spěchat“, „Stačí jedna věta“ |
| **Jednoduchá**: i při únavě | Velká písmena a tlačítka (min. 44–52 px), málo voleb, vzhled dopisu schovaný pod jedním tlačítkem |
| **Po malých krocích** | Každé písmeno se hned uloží, rozepsaný text se obnoví, „Dnešní malý krok“ = jedna věta |
| **Soukromá** | Žádný veřejný profil ani sdílení. Data vidí jen přihlášený rodič, hlídá to databáze |
| **Osobní** | Samostatný profil a prostor pro každé dítě |
| **Otevřená nápadům** | Inspirace + nápady na dary mimo telefon |
| **Fiktivní data** | Demo obsahuje jen smyšlená jména a texty |
| **Předání ≠ uložení** | Předání dítěti je podle zadání až další fáze, appka ho záměrně nedělá |
| **Žádná sociální síť** | Appka nemá žádnou sociální funkci |

---

## 3. Vyzkoušení

### Na webu (nejrychlejší)
1. Otevřete **https://rakathon-vzpominky.vercel.app** (funguje na počítači, tabletu i v mobilu).
2. Klepněte na **„Vyzkoušet demo“**. Vytvoří se vám vlastní oddělený demo účet s fiktivní rodinou
   a ukáže se uvítací průvodce (můžete ho přeskočit).
3. Demo ukončíte ve **Správci schránky → Ukončit demo**. Ukázková data se tím smažou.

### Na telefonu přes Expo Go
1. Nainstalujte si **Expo Go** (Google Play / App Store).
2. Na počítači s projektem spusťte `npm start`. Pokud telefon není ve stejné Wi-Fi síti (nebo síť
   zařízení odděluje, jako na hackathonu), použijte `npm run start:tunnel` (tunel přes ngrok,
   nepotřebuje účet u Expa).
3. Naskenujte QR kód: na Androidu v aplikaci Expo Go, na iPhonu fotoaparátem.

---

## 4. Jak aplikace funguje (pro laiky)

```
 ┌───────────────────────────┐         šifrovaně (HTTPS)        ┌──────────────────────────────┐
 │  Telefon nebo prohlížeč   │ ───────────────────────────────▶ │  Supabase (databáze, Londýn)  │
 │                           │                                   │                              │
 │  Aplikace Schránka        │ ◀─────────────────────────────── │  Přihlášení (Auth)            │
 │  vzpomínek                │       jen VAŠE děti a dopisy      │  Tabulky: děti, dopisy        │
 │                           │                                   │  Pravidla: každý vidí jen své │
 │  localStorage:            │                                   └──────────────────────────────┘
 │  přihlášení + rozepsaný   │
 │  text (záloha)            │      Vercel jen doručí samotnou aplikaci (soubory),
 └───────────────────────────┘      žádná osobní data přes něj nejdou.
```

1. **Aplikace** je jedna sada kódu (React Native). Běží jako mobilní appka i jako webová stránka.
2. **Přihlášení** zajišťuje Supabase. Po přihlášení si zařízení pamatuje „vstupenku“ (token)
   v localStorage, takže se nemusíte přihlašovat znovu ani po restartu.
3. **Data** (děti a dopisy) jsou v databázi. Databáze u každého řádku kontroluje, komu patří.
   Cizí data vám nevydá, ani kdyby někdo obešel aplikaci a ptal se databáze napřímo.
4. **Psaní** se ukládá dvakrát: okamžitě do zařízení a po chvilce do databáze. Když vypadne
   internet nebo se appka zavře, text se při dalším otevření obnoví.

---

## 5. Technologie

| Vrstva | Technologie | Proč |
|---|---|---|
| Aplikace | **React Native 0.88 + Expo SDK 58**, TypeScript | Jeden kód pro Android, iPhone i web |
| Navigace | **Expo Router** (soubory = obrazovky, chráněné cesty) | Přehledné, chrání stránky bez přihlášení |
| Databáze a přihlášení | **Supabase** (PostgreSQL 17, Auth, Row Level Security) | Zabezpečení přímo v databázi |
| Úložiště v zařízení | **localStorage** (web) / **expo-sqlite localStorage** (telefon) | Přihlášení a záloha rozepsaných textů |
| Hosting webu | **Vercel** (statické soubory + bezpečnostní hlavičky) | Veřejný odkaz, HTTPS |
| Písma | Lora (nadpisy), Nunito (text), Caveat (ručně psané) | Teplý vzhled podle návrhů, české znaky |
| Připomínky | **expo-notifications** (plánované přímo v telefonu, bez serveru) | Jen na přání uživatele, nic se neposílá ven |
| Ilustrace | Akvarely z podkladů FN Olomouc, oříznuté a prolnuté (ImageMagick → WebP) | Vizuální konzistence s návrhy, malá velikost (24–68 kB) |
| Testy | puppeteer-core + Firefox (E2E), axe-core (přístupnost), supabase-js (bezpečnost) | Automatické ověření průchodů, UI/UX i ochrany dat |

---

## 6. Struktura projektu

```
rakathon/
├── src/
│   ├── app/                         ← OBRAZOVKY (každý soubor = jedna obrazovka / adresa)
│   │   ├── _layout.tsx              hlavní rám: písma, přihlášení, průvodce, chráněné obrazovky
│   │   ├── prihlaseni.tsx           přihlášení, registrace, „Vyzkoušet demo“
│   │   ├── vitejte.tsx              uvítací průvodce (podpora, zájmy, připomenutí)
│   │   ├── smysl.tsx                Proč to má smysl
│   │   ├── (tabs)/                  4 hlavní obrazovky
│   │   │   ├── _layout.tsx          menu: dole na telefonu, vlevo na počítači
│   │   │   ├── index.tsx            Místo pro slova (domů)
│   │   │   ├── deti.tsx             Moje děti
│   │   │   ├── inspirace.tsx        Inspirace a tipy
│   │   │   └── spravce.tsx          Správce schránky (přehled, export, účet)
│   │   ├── dite/
│   │   │   ├── novy.tsx             přidat dítě
│   │   │   └── [id]/index.tsx       profil dítěte
│   │   │   └── [id]/upravit.tsx     upravit / smazat profil
│   │   └── dopis/[id].tsx           psaní a čtení dopisu (/dopis/novy?dite=… pro nový)
│   ├── components/                  ← OPAKOVANĚ POUŽITÉ DÍLKY
│   │   ├── screen.tsx               rám obrazovky (pozadí, posouvání, klávesnice)
│   │   ├── button.tsx, text-field.tsx, chip.tsx, dialog.tsx, states.tsx
│   │   ├── child-avatar.tsx, child-form.tsx, letter-row.tsx, back-header.tsx
│   │   ├── option-card.tsx          volba s ikonou (průvodce, nastavení)
│   │   ├── timeline.tsx             časová osa dítěte
│   │   ├── illustration.tsx         akvarelová ilustrace
│   │   └── letter/                  papír, volba vzhledu, výběr dítěte
│   ├── hooks/
│   │   ├── use-focus-data.ts        načtení dat při každém zobrazení obrazovky
│   │   ├── use-layout.ts            telefon / tablet / počítač podle šířky okna
│   │   └── use-letter-autosave.ts   průběžné ukládání dopisu (zařízení → databáze)
│   ├── lib/                         ← LOGIKA BEZ VZHLEDU
│   │   ├── supabase.ts              připojení k databázi
│   │   ├── auth.tsx                 přihlášení, demo, odhlášení, smazání účtu
│   │   ├── data.ts                  všechny dotazy na děti a dopisy
│   │   ├── storage.ts               localStorage pro web i telefon
│   │   ├── drafts.ts                místní záloha rozepsaných dopisů
│   │   ├── preferences.tsx          jemné vedení / klidný režim, zájmy, připomínky
│   │   ├── reminders(.native).ts    připomínky v telefonu (na webu se jen uloží volba)
│   │   ├── export.ts                export vzkazů do souboru
│   │   ├── format.ts                české datum, věk, skloňování
│   │   ├── errors.ts                srozumitelné české chybové hlášky
│   │   └── database.types.ts        typy vygenerované z databáze
│   └── constants/
│       ├── theme.ts                 barvy, písma, rozestupy (podle návrhů obrazovek ze zadání)
│       ├── choices.ts               papíry, písma, nálepky, příležitosti, barvy profilu
│       ├── support.ts               volby podpory, připomínek a citáty dne
│       ├── illustrations.ts         seznam ilustrací
│       └── inspiration.ts           otázky, životní příběhy, dary mimo aplikaci
├── supabase/migrations/             ← DATABÁZE (tabulky, pravidla, ukázková data)
├── scripts/security-check.mjs       bezpečnostní test databáze
├── tests/e2e/                       testy v prohlížeči (80 kontrol)
├── tests/ui/                        UI/UX audit (velikosti obrazovek, přístupnost) + report.md
├── public/index.html                šablona webové stránky (čeština, styly prohlížeče)
├── assets/images/                   ikona aplikace a ilustrace
├── app.json                         nastavení aplikace (název, ikona, barvy)
├── vercel.json                      nasazení webu + bezpečnostní hlavičky
└── navrh                            původní zadání týmu
```

---

## 7. Datový model

**`children`**: děti

| Sloupec | Význam | Kontrola v databázi |
|---|---|---|
| `id` | jedinečné ID | generuje databáze |
| `owner_id` | rodič (účet) | nastavuje databáze podle přihlášení, nejde podvrhnout |
| `name` | jméno | 1–60 znaků, nesmí být prázdné |
| `birth_date` | datum narození (nepovinné) | rozumný rozsah |
| `description` | pár slov o dítěti | max. 500 znaků |
| `color` | barva profilu | jen povolené hodnoty |

**`letters`**: dopisy a vzkazy

| Sloupec | Význam | Kontrola v databázi |
|---|---|---|
| `child_id` + `owner_id` | ke kterému dítěti patří | **složený klíč**: jen k vlastnímu dítěti |
| `title`, `body` | název a text | max. 120 / 20 000 znaků |
| `status` | `koncept` nebo `hotovo` | jen tyto dvě hodnoty |
| `occasion` | příležitost (narozeniny, svatba…) | max. 80 znaků |
| `paper`, `font`, `sticker` | vzhled | jen povolené hodnoty |
| `created_at`, `updated_at`, `finished_at` | časy | nastavuje databáze |

Migrace jsou v `supabase/migrations/`:
- `20261016150000_init.sql`: tabulky, pravidla přístupu, triggery, smazání účtu
- `20261016151000_demo_seed.sql`: fiktivní data pro demo účty

---

## 8. Bezpečnost a ochrana dat

> Shrnutí: **každý rodič vidí a mění jen svá data, a hlídá to přímo databáze.** Ochrana tedy
> platí, i kdyby někdo aplikaci obešel a volal databázi napřímo. Ověřuje to automatický test.

### 8.1 Přístup k datům
- **Row Level Security (RLS)** na obou tabulkách. Databáze ke každému řádku přidá podmínku
  „patří přihlášenému uživateli“, a to pro čtení, vkládání, úpravy i mazání.
- **Nepřihlášený uživatel nemá žádná práva.** Roli `anon` jsme odebrali všechna oprávnění.
- **Přihlášený smí měnit jen vybrané sloupce.** Vlastníka, ID ani časy nemůže zapsat ani změnit.
  Vlastníka navíc vždy nastaví trigger podle přihlášení.
- **Složený cizí klíč** `(child_id, owner_id)`: dopis nejde „přilepit“ k cizímu dítěti, ani když
  někdo zná jeho ID. Obyčejný cizí klíč by to nezachytil, protože RLS na kontrolu klíčů neplatí.
- **Kontroly hodnot** (délky, povolené stavy) přímo v databázi.
- **Limity proti zneužití:** max. 20 dětí a 1000 vzkazů na účet.
- Pomocné funkce jsou v neveřejném schématu `private` s pevným `search_path`.

### 8.2 Přihlášení
- Supabase Auth: hesla jsou uložená jako hash, nikdy v čitelné podobě. Minimální délka hesla je 8 znaků.
- Přihlašovací token se automaticky obnovuje (platnost 1 h, rotace obnovovacích tokenů).
- **Demo účty** jsou anonymní a každý má vlastní oddělená fiktivní data. Při ukončení dema se
  smažou i s daty.
- E-mail se nepotvrzuje. Na hackathonu by limit Supabase (2 e-maily za hodinu) zablokoval
  registrace. Pro ostrý provoz potvrzování zapneme.

### 8.3 Klíče a tajemství
- V aplikaci je jen **veřejný (publishable) klíč**. Ten je veřejný záměrně, data chrání RLS.
- **Tajný klíč (service role)** aplikace nikdy nevidí. Je jen v lokálním `.env.local`, který
  nejde na GitHub (`.gitignore`) ani na Vercel (`.vercelignore`).

### 8.4 Web
Vercel posílá bezpečnostní hlavičky (`vercel.json`):
- **Content-Security-Policy**: skripty jen z naší domény, síťová spojení jen na naši databázi,
  žádné vkládání do cizích stránek. To brání krádeži přihlášení přes podvržený skript (XSS).
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
  `Strict-Transport-Security`, `Permissions-Policy` (zakázaná kamera, mikrofon, poloha),
  `noindex` (soukromá aplikace nemá být ve vyhledávačích).
- Text se nikdy nevkládá jako HTML (React Native ho vždy zobrazí jako text).

### 8.5 Soukromí a GDPR
- **Data leží v EU-kompatibilní lokalitě:** Supabase, region `eu-west-2` (Londýn). Velká
  Británie má od EU rozhodnutí o odpovídající ochraně.
- **Minimalizace:** ukládáme jen e-mail, jména dětí (nebo přezdívky) a texty dopisů.
  Žádná analytika, reklama ani sledování.
- **Právo na výmaz:** Správce schránky → *Smazat účet a všechna data*. Databáze smaže účet
  i všechny děti a dopisy najednou (`on delete cascade`).
- **Přenositelnost:** export všech vzkazů do textového souboru.
- **Sdílené zařízení:** při odhlášení se smaže přihlášení i místní zálohy textů.

### 8.6 Co bychom přidali pro ostré nasazení
- **Šifrování dopisů v zařízení (end-to-end):** text by se šifroval klíčem odvozeným z hesla.
  Nikdo kromě rodiče, ani správce databáze, by ho nepřečetl.
- Potvrzení e-mailu, kontrola uniklých hesel, CAPTCHA pro demo účty, dvoufázové ověření.
- Hosting přímo v EU (např. Frankfurt), smlouva o zpracování osobních údajů, posouzení DPIA.
- Pravidelné mazání starých demo účtů (plánovaná úloha v databázi).
- **Předání dítěti** (další fáze podle zadání): „strážce vzkazů“ (důvěryhodná osoba) potvrdí
  milník a dítě dostane jednorázový odkaz.

---

## 9. Co se ukládá v zařízení (localStorage)

Na webu jde o `localStorage` prohlížeče, v telefonu o stejné rozhraní z `expo-sqlite`. Všechny
klíče začínají `schranka:`.

| Klíč | Obsah | Proč | Kdy se maže |
|---|---|---|---|
| `schranka:prihlaseni` | přihlašovací token Supabase | zůstanete přihlášení i po restartu | odhlášení |
| `schranka:posledni-email` | poslední použitý e-mail | předvyplnění přihlášení | smazání účtu |
| `schranka:rozepsano:<id>` | rozepsaný text dopisu | ochrana proti ztrátě při výpadku internetu | po uložení do databáze, při odhlášení |
| `schranka:nastaveni:<uživatel>` | zvolená podpora, zájmy a připomínky | appka se chová podle přání i bez internetu (zároveň se ukládá k účtu) | smazání účtu |

---

## 10. Spuštění pro vývojáře

**Požadavky:** Node.js 20+ (testováno na 24), npm, účet Supabase.

```bash
npm install

# .env.local (nejde do gitu)
EXPO_PUBLIC_SUPABASE_URL=https://<projekt>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

npm start           # vývojový server + QR kód pro Expo Go
npm run web         # web v prohlížeči
npm run typecheck   # kontrola typů
npm run lint        # kontrola kódu
```

**Databáze:** spusťte SQL z `supabase/migrations/` (v pořadí podle názvu) v Supabase SQL editoru.
V nastavení Auth zapněte *Anonymous sign-ins* (demo) a *Confirm email* nechte vypnuté.

---

## 11. Testy

| Příkaz | Co ověřuje |
|---|---|
| `npm run test:security` | 18 kontrol zabezpečení databáze: dva účty, „útoky“ jednoho na druhý (čtení, změna, mazání cizích dat, podvržení vlastníka, cizí dítě), nepřihlášený přístup, kontroly hodnot, smazání účtu. Test po sobě uklidí |
| `npm run test:e2e` | 80 kontrol v prohlížeči: přihlášení a localStorage, chráněné stránky, uvítací průvodce, děti, **všech 5 akceptačních kroků**, obnova textu po zavření, časová osa, klidný režim, inspirace, Správce, filtry, hledání, export |
| `npm run test:ui` | UI/UX audit: všechny obrazovky v 6 velikostech (viz [kapitola 12](#12-uiux-přístupnost-a-responzivita)) |

```bash
npm run build:web && npm run serve:web            # v jednom terminálu
npm run test:e2e                                  # ve druhém
npm run test:ui                                   # audit, výsledek v tests/ui/report.md
BASE_URL=https://rakathon-vzpominky.vercel.app npm run test:e2e   # nebo proti produkci
```

Testy v prohlížeči používají nainstalovaný Firefox (případně `FIREFOX=/cesta/k/firefox`).

---

## 12. UI/UX: přístupnost a responzivita

Aplikace je pro lidi, kteří mohou být unavení nebo mít horší zrak, a pro porotu, která ji otevře
na čemkoli. Proto ji automaticky kontrolujeme ve **6 velikostech**: malý telefon 320 px, telefon
390 px, telefon na šířku, tablet 768 px, notebook 1280 px a monitor 1600 px. Kontrolujeme všech
**11 obrazovek**, celkem 66 kombinací.

| Kontrola | Pravidlo | Výsledek |
|---|---|---|
| Přetékání do stran | nic nesmí být mimo obrazovku ani vodorovně posouvat | **0** |
| Klikací plochy | aspoň 44 × 44 px (doporučení Apple a WCAG 2.5.5) | **0** menších |
| Popisky pro čtečku obrazovky | každé tlačítko a pole má název | **0** bez popisku |
| Velikost písma | nic pod 12 px, běžný text 15–19 px | **0** menších |
| WCAG 2.2 A/AA (axe-core) | kontrast, role, stavy přepínačů, alternativní texty… | **0** porušení |
| Chyby v konzoli prohlížeče | žádné | **0** |

Podrobný výsledek je v [`tests/ui/report.md`](tests/ui/report.md).

**Co jsme kvůli tomu upravili:**
- **Kontrast:** všechny dvojice text/pozadí mají aspoň 4,5 : 1. Terakotová tlačítka jsme mírně
  ztmavili (bílé písmo 5,3 : 1), šedý text taky.
- **Rozvržení:** na telefonu je menu dole, na počítači vlevo s logem. Od tabletu jsou karty ve
  dvou sloupcích a domovská obrazovka má volby vedle sebe. Text dopisu má příjemnou šířku řádku.
- **Ovládání:** přepínače hlásí čtečce, jestli jsou zapnuté. Ovládání klávesnicí má viditelné
  zvýraznění. Dlouhé podržení tlačítka nevybírá text a při klepnutí nic nebliká.
- **Prvky prohlížeče** jsou v barvách aplikace: výběr textu, kurzor, posuvníky, zástupný text.
- **Ilustrace** mají rezervované místo (stránka neposkakuje) a čtečka je přeskakuje jako dekoraci.

---

## 13. Nasazení

- **Web:** Vercel, projekt `rakathon-26`, adresa **https://rakathon-vzpominky.vercel.app** (stará
  adresa `rakathon-26.vercel.app` na ni přesměrovává). `vercel.json` určuje sestavení (`expo export -p web`),
  přesměrování pro jednostránkovou aplikaci a bezpečnostní hlavičky.
  Proměnné `EXPO_PUBLIC_SUPABASE_URL` a `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` jsou v nastavení Vercelu.
  Nasazení: `npx vercel deploy --prod`.
- **Telefon:** Expo Go pro demo. Pro obchody by se použilo EAS Build (`npx eas-cli build`).

---

## 14. Co dál

1. **Hlas a video:** nahrát známý hlas, pohádku na dobrou noc.
2. **Fotografie** k dopisům.
3. **Předání dítěti** (další fáze podle zadání): strážce vzkazů potvrdí milník, dítě dostane
   bezpečný jednorázový odkaz.
4. **Mapa vzpomínek** v pastelové krajině jako vizuální přehled (běžný seznam zůstane).
5. **Šifrování end-to-end** (viz 8.6).
6. **Export do PDF** a tisk na papír, převod řeči na text.
7. Spolupráce s psychology na dalších inspiračních otázkách a ověření s pacienty.

---

*Kód vznikl během 24 hodin s pomocí AI (Claude Code) pod vedením týmu. Tým dělal produktová
rozhodnutí, rešerši zadání a testování. Ilustrace pocházejí z podkladů FN Olomouc k výzvě.
Všechna data v demu jsou smyšlená.*
