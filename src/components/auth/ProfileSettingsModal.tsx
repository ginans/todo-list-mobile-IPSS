import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { IUserProfile } from '../../core/auth/interfaces/user-profile.interface';
import { AppButton } from '../ui/AppButton';
import { AppConfirmDialog } from '../ui/AppConfirmDialog';
import { styles } from './styles/profile-settings-modal.styles';

interface ProfileSettingsModalProps {
  visible: boolean;
  onDismiss: () => void;
  profile: IUserProfile;
  biometricLabel?: string;
  storageStats: {
    total: number;
    photosCount: number;
    photosSizeKb: number;
    locationsCount: number;
  };
  onDeleteProfile: () => Promise<void>;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  visible,
  onDismiss,
  profile,
  biometricLabel = 'Biometría',
  storageStats,
  onDeleteProfile,
}) => {
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onDeleteProfile();
    setIsDeleting(false);
    setIsConfirmVisible(false);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={isDeleting ? undefined : onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatarCircle, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarInitial}>
              {profile.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileSubtitle}>
              {profile.biometricEnabled
                ? `Protegido con PIN y ${biometricLabel}`
                : 'Protegido con PIN de 4 dígitos'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Tu cuaderno local</Text>
          <Text style={styles.summaryText}>
            {storageStats.total} tareas • {storageStats.photosCount} fotos (
            {storageStats.photosSizeKb} KB) • {storageStats.locationsCount} ubicaciones GPS
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <AppButton
            label="Eliminar perfil"
            onPress={() => setIsConfirmVisible(true)}
            variant="danger"
            icon="trash-can-outline"
            compact
            disabled={isDeleting}
          />
          <AppButton
            label="Cerrar"
            onPress={onDismiss}
            variant="ghost"
            compact
            disabled={isDeleting}
          />
        </View>
      </Modal>

      <AppConfirmDialog
        visible={isConfirmVisible}
        title="¿Eliminar tu perfil?"
        message={`Se eliminará permanentemente el perfil "${profile.name}" junto con todas sus tareas y fotos guardadas en este dispositivo.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDestructive
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmVisible(false)}
      />
    </Portal>
  );
};
