import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ChildAvatar } from '@/components/child-avatar';
import { TextField } from '@/components/text-field';
import { CHILD_COLORS } from '@/constants/choices';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Child, ChildColor, ChildInput } from '@/lib/data';
import { formatBirthDate, parseCzechDate } from '@/lib/format';

type Props = {
  initial?: Child;
  submitLabel: string;
  onSubmit: (input: ChildInput) => Promise<string | null>;
};

export function ChildForm({ initial, submitLabel, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [birth, setBirth] = useState(formatBirthDate(initial?.birth_date));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [color, setColor] = useState<ChildColor>((initial?.color as ChildColor) ?? 'rose');
  const [errors, setErrors] = useState<{ name?: string; birth?: string; form?: string }>({});
  const [saving, setSaving] = useState(false);

  async function submit() {
    const next: typeof errors = {};
    const cleanName = name.trim();
    if (!cleanName) next.name = 'Napište prosím jméno.';
    const birthDate = parseCzechDate(birth);
    if (birthDate === 'invalid') next.birth = 'Napište datum jako 15. 5. 2019, nebo pole nechte prázdné.';
    setErrors(next);
    if (next.name || next.birth) return;

    setSaving(true);
    const error = await onSubmit({
      name: cleanName,
      birth_date: birthDate === 'invalid' ? null : birthDate,
      description: description.trim() || null,
      color,
    });
    setSaving(false);
    if (error) setErrors({ form: error });
  }

  return (
    <View style={styles.form}>
      <View style={styles.preview}>
        <ChildAvatar name={name || '?'} color={color} size={88} />
      </View>

      <TextField
        label="Jméno nebo oslovení"
        value={name}
        onChangeText={setName}
        placeholder="např. Eliška"
        error={errors.name}
        maxLength={60}
        autoCapitalize="words"
        returnKeyType="next"
      />
      <TextField
        label="Datum narození (nepovinné)"
        value={birth}
        onChangeText={setBirth}
        placeholder="např. 15. 5. 2019"
        hint="Podle něj se ukazuje věk. Můžete ho kdykoli doplnit."
        error={errors.birth}
        keyboardType="numbers-and-punctuation"
        maxLength={14}
      />
      <TextField
        label="Pár slov o dítěti (nepovinné)"
        value={description}
        onChangeText={setDescription}
        placeholder="Jaké je? Co má rádo?"
        multiline
        maxLength={500}
      />

      <View style={styles.colors}>
        <Text style={styles.colorsLabel}>Barva profilu</Text>
        <View style={styles.colorRow} accessibilityRole="radiogroup">
          {(Object.keys(CHILD_COLORS) as ChildColor[]).map((key) => {
            const selected = key === color;
            return (
              <Pressable
                key={key}
                accessibilityRole="radio"
                accessibilityLabel={CHILD_COLORS[key].label}
                aria-checked={selected}
                onPress={() => setColor(key)}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: CHILD_COLORS[key].bg,
                    borderColor: selected ? CHILD_COLORS[key].fg : 'transparent',
                  },
                ]}>
                {selected && <Ionicons name="checkmark" size={22} color={CHILD_COLORS[key].fg} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

      <Button label={submitLabel} icon="checkmark" onPress={submit} loading={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.md,
  },
  preview: {
    alignItems: 'center',
  },
  colors: {
    gap: Spacing.sm,
  },
  colorsLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formError: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.danger,
  },
});
