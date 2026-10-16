// Veškerá práce s daty na jednom místě. Obrazovky volají tyto funkce,
// samy s databází nemluví. Chyby se převádějí na srozumitelné české věty.

import type { Tables, TablesInsert, TablesUpdate } from './database.types';
import { toMessage } from './errors';
import { supabase } from './supabase';

export type Child = Tables<'children'>;
export type Letter = Tables<'letters'>;

export type LetterStatus = 'koncept' | 'hotovo';
export type ChildColor = 'rose' | 'sage' | 'peach' | 'lavender' | 'sky';
export type Paper = 'bezova' | 'ruzova' | 'salvejova' | 'merunkova' | 'piskova';
export type LetterFont = 'lora' | 'nunito' | 'caveat';
export type Sticker = 'srdce' | 'kvetina' | 'hvezda' | 'medvidek' | 'slunce' | 'duha' | 'obalka';

export type ChildWithCounts = Child & { drafts: number; finished: number };
export type LetterWithChild = Letter & { child: Pick<Child, 'id' | 'name' | 'color'> | null };

export type ChildInput = Pick<TablesInsert<'children'>, 'name' | 'birth_date' | 'description' | 'color'>;
export type LetterInput = Pick<
  TablesInsert<'letters'>,
  'child_id' | 'title' | 'body' | 'status' | 'occasion' | 'paper' | 'font' | 'sticker'
>;
export type LetterPatch = Pick<
  TablesUpdate<'letters'>,
  'title' | 'body' | 'status' | 'occasion' | 'paper' | 'font' | 'sticker'
>;

function fail(error: { message?: string; code?: string } | null): never {
  throw new Error(toMessage(error));
}

// ---------------------------------------------------------------- děti

export async function listChildren(): Promise<ChildWithCounts[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*, letters(status)')
    .order('created_at', { ascending: true });
  if (error) fail(error);
  return data.map(({ letters, ...child }) => ({
    ...child,
    drafts: letters.filter((l) => l.status === 'koncept').length,
    finished: letters.filter((l) => l.status === 'hotovo').length,
  }));
}

export async function getChild(id: string): Promise<Child> {
  const { data, error } = await supabase.from('children').select('*').eq('id', id).single();
  if (error) fail(error);
  return data;
}

export async function createChild(input: ChildInput): Promise<Child> {
  const { data, error } = await supabase.from('children').insert(input).select().single();
  if (error) fail(error);
  return data;
}

export async function updateChild(id: string, input: ChildInput): Promise<Child> {
  const { data, error } = await supabase.from('children').update(input).eq('id', id).select().single();
  if (error) fail(error);
  return data;
}

export async function deleteChild(id: string): Promise<void> {
  const { error } = await supabase.from('children').delete().eq('id', id);
  if (error) fail(error);
}

// ---------------------------------------------------------------- vzkazy

const LETTER_WITH_CHILD = '*, child:children(id, name, color)';

export async function listLetters(
  filter: { childId?: string; status?: LetterStatus } = {},
): Promise<LetterWithChild[]> {
  let query = supabase.from('letters').select(LETTER_WITH_CHILD).order('updated_at', { ascending: false });
  if (filter.childId) query = query.eq('child_id', filter.childId);
  if (filter.status) query = query.eq('status', filter.status);
  const { data, error } = await query;
  if (error) fail(error);
  return data;
}

/** Kolik vzkazů v daném stavu rodič má (jen počet, bez stahování textů). */
export async function countLetters(status: LetterStatus): Promise<number> {
  const { count, error } = await supabase
    .from('letters')
    .select('id', { count: 'exact', head: true })
    .eq('status', status);
  if (error) fail(error);
  return count ?? 0;
}

export async function getLetter(id: string): Promise<LetterWithChild> {
  const { data, error } = await supabase.from('letters').select(LETTER_WITH_CHILD).eq('id', id).single();
  if (error) fail(error);
  return data;
}

export async function createLetter(input: LetterInput): Promise<Letter> {
  const { data, error } = await supabase.from('letters').insert(input).select().single();
  if (error) fail(error);
  return data;
}

export async function updateLetter(id: string, patch: LetterPatch): Promise<Letter> {
  const { data, error } = await supabase.from('letters').update(patch).eq('id', id).select().single();
  if (error) fail(error);
  return data;
}

export async function deleteLetter(id: string): Promise<void> {
  const { error } = await supabase.from('letters').delete().eq('id', id);
  if (error) fail(error);
}
