import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Body, Heading } from '@/components/typography';
import { Colors, Radius, Spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
  onClose: () => void;
  children?: ReactNode;
};

/** Jemné okno uprostřed obrazovky. Funguje stejně na webu i v telefonu. */
export function Dialog({ visible, title, message, icon, iconColor = Colors.primary, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable accessibilityLabel="Zavřít" style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card} accessibilityViewIsModal>
          {icon && (
            <View style={styles.icon}>
              <Ionicons name={icon} size={30} color={iconColor} />
            </View>
          )}
          <Heading style={styles.center}>{title}</Heading>
          {message && <Body style={styles.center}>{message}</Body>}
          <View style={styles.actions}>{children}</View>
        </View>
      </View>
    </Modal>
  );
}

type ConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Potvrzení před nevratnou akcí (smazání). Výchozí volba je bezpečné „Ponechat“. */
export function ConfirmDialog({ visible, title, message, confirmLabel, danger, busy, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Dialog
      visible={visible}
      title={title}
      message={message}
      icon={danger ? 'trash-outline' : 'help-circle-outline'}
      iconColor={danger ? Colors.danger : Colors.primary}
      onClose={onCancel}>
      <Button label="Ponechat" variant="secondary" onPress={onCancel} disabled={busy} />
      <Button label={confirmLabel} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} loading={busy} />
    </Dialog>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(74, 59, 56, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'stretch',
  },
  icon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
