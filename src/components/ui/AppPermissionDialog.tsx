import React from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppButton } from './AppButton';
import { semanticColors } from '../../theme/app-theme';
import { styles } from './styles/app-permission-dialog.styles';

interface AppPermissionDialogProps {
  visible: boolean;
  title: string;
  message: string;
  canAskAgain?: boolean;
  onRetry?: () => void;
  onDismiss: () => void;
}

export const AppPermissionDialog: React.FC<AppPermissionDialogProps> = ({
  visible,
  title,
  message,
  canAskAgain = false,
  onRetry,
  onDismiss,
}) => {
  const handleOpenSettings = async () => {
    onDismiss();
    if (Platform.OS !== 'web') {
      try {
        await Linking.openSettings();
      } catch {
        // Fallback silencioso si el entorno no soporta openSettings
      }
    }
  };

  const handleRetry = () => {
    onDismiss();
    onRetry?.();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={22}
              color={semanticColors.warning}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <AppButton
            label="Continuar sin permiso"
            onPress={onDismiss}
            variant="ghost"
            compact
          />
          {canAskAgain && onRetry ? (
            <AppButton
              label="Reintentar solicitud"
              onPress={handleRetry}
              variant="primary"
              compact
            />
          ) : (
            Platform.OS !== 'web' && (
              <AppButton
                label="Abrir Configuración"
                onPress={handleOpenSettings}
                variant="primary"
                compact
              />
            )
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
