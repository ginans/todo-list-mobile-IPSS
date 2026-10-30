import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import { AppButton } from './AppButton';
import { semanticColors } from '../../theme/app-theme';

interface AppConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Componente Reutilizable: AppConfirmDialog
 * Diálogo modal para confirmación de acciones irreversibles (borrado, reseteo).
 */
export const AppConfirmDialog: React.FC<AppConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <AppButton
            label={cancelLabel}
            onPress={onCancel}
            variant="ghost"
            compact
            disabled={loading}
          />
          <View style={styles.spacer} />
          <AppButton
            label={confirmLabel}
            onPress={onConfirm}
            variant={isDestructive ? 'danger' : 'primary'}
            loading={loading}
            compact
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  message: {
    fontSize: 14,
    color: semanticColors.mutedText,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    flexDirection: 'row',
  },
  spacer: {
    width: 8,
  },
});
