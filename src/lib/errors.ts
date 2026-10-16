// Převádí technické chyby na srozumitelné české věty.

type MaybeError = { code?: string; message?: string; status?: number } | null | undefined;

const AUTH_MESSAGES: Record<string, string> = {
  invalid_credentials: 'E-mail nebo heslo nesedí. Zkuste to prosím znovu.',
  user_already_exists: 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
  email_exists: 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
  weak_password: 'Heslo je příliš slabé. Použijte aspoň 8 znaků.',
  email_address_invalid: 'Zkontrolujte prosím, jestli je e-mail napsaný správně.',
  validation_failed: 'Zkontrolujte prosím e-mail a heslo.',
  over_request_rate_limit: 'Příliš mnoho pokusů za krátkou dobu. Zkuste to prosím za chvíli.',
  over_email_send_rate_limit: 'Příliš mnoho pokusů za krátkou dobu. Zkuste to prosím za chvíli.',
  anonymous_provider_disabled: 'Demo je teď vypnuté. Vytvořte si prosím účet.',
  signup_disabled: 'Registrace je teď vypnutá.',
};

const DB_MESSAGES: Record<string, string> = {
  // Porušení kontroly hodnot v databázi (např. příliš dlouhý text).
  '23514': 'Některý údaj je moc dlouhý nebo neplatný.',
  '23503': 'Tento záznam už neexistuje.',
  '42501': 'K tomuto záznamu nemáte přístup.',
  PGRST116: 'Tento záznam už neexistuje.',
};

export function toMessage(error: MaybeError, fallback = 'Něco se nepovedlo. Zkuste to prosím znovu.'): string {
  if (!error) return fallback;
  const message = error.message ?? '';
  if (/fetch|network|Network request failed|timeout/i.test(message)) {
    return 'Nedaří se připojit k internetu. Zkontrolujte připojení a zkuste to znovu.';
  }
  if (error.code && AUTH_MESSAGES[error.code]) return AUTH_MESSAGES[error.code];
  if (error.code && DB_MESSAGES[error.code]) return DB_MESSAGES[error.code];
  // Vlastní hlášky z databáze (limity) jsou už česky.
  if (error.code === 'P0001' && message) return message;
  if (error.status === 429) return AUTH_MESSAGES.over_request_rate_limit;
  return fallback;
}
