// Diktování: řeč se během mluvení mění na text (Web Speech API prohlížeče).
// Umí ho Chrome, Edge a Safari. Jinde (Firefox, mobilní aplikace) se tlačítko neukáže
// a v telefonu stačí mikrofon na klávesnici.
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type Alternative = { transcript: string };
type Result = { isFinal: boolean; 0: Alternative };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<Result> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};
type RecognitionClass = new () => Recognition;

function recognitionClass(): RecognitionClass | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function dictationSupported() {
  return !!recognitionClass();
}

/** Připojí nadiktovaný kus textu: s mezerou a velkým písmenem na začátku věty. */
export function appendDictated(text: string, piece: string) {
  const clean = piece.trim();
  if (!clean) return text;
  const startsSentence = !text.trim() || /[.!?…]\s*$/.test(text) || /\n\s*$/.test(text);
  const part = startsSentence ? clean.charAt(0).toLocaleUpperCase('cs') + clean.slice(1) : clean;
  if (!text) return part;
  return /\s$/.test(text) ? text + part : `${text} ${part}`;
}

const MESSAGES: Record<string, string> = {
  'not-allowed': 'Prohlížeč nedovolil použít mikrofon. Povolit ho můžete v nastavení prohlížeče u této stránky.',
  'service-not-allowed':
    'Prohlížeč nedovolil použít mikrofon. Povolit ho můžete v nastavení prohlížeče u této stránky.',
  'audio-capture': 'Nenašli jsme mikrofon. Zkontrolujte, jestli je připojený.',
  network: 'Diktování potřebuje internet. Zkuste to prosím znovu, až bude připojení.',
};

export function useDictation(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  // Vždy nejnovější verze funkce (text dopisu se mezitím mění).
  const latest = useRef(onText);
  useEffect(() => {
    latest.current = onText;
  });

  // Při odchodu z obrazovky diktování vypneme.
  useEffect(() => () => recognition.current?.abort(), []);

  function start() {
    const Recognition = recognitionClass();
    if (!Recognition || recognition.current) return;
    setError(null);
    const rec = new Recognition();
    rec.lang = 'cs-CZ';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      let finished = '';
      let pending = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finished += result[0].transcript;
        else pending += result[0].transcript;
      }
      if (finished.trim()) latest.current(finished);
      setInterim(pending.trim());
    };
    rec.onerror = (event) => {
      // Ticho nebo ruční zastavení nejsou chyba.
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      setError(MESSAGES[event.error] ?? 'Diktování se nepodařilo. Zkuste to prosím znovu.');
    };
    rec.onend = () => {
      recognition.current = null;
      setListening(false);
      setInterim('');
    };
    try {
      rec.start();
      recognition.current = rec;
      setListening(true);
    } catch {
      setError('Diktování se nepodařilo spustit. Zkuste to prosím znovu.');
    }
  }

  function stop() {
    recognition.current?.stop();
  }

  return { supported: dictationSupported(), listening, interim, error, start, stop };
}
