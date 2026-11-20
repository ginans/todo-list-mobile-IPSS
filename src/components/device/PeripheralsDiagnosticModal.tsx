import React, { useEffect, useState, useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ActivityIndicator, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import { IBiometricCapability } from '../../core/device/interfaces/peripheral-result.interface';
import { ITaskLocation } from '../../core/task/interfaces/task-location.interface';
import {
  checkCameraPermission,
  requestCameraPermission,
} from '../../infra/device/camera.service';
import {
  checkLocationPermission,
  formatCoordinates,
  getCurrentLocation,
} from '../../infra/device/location.service';
import {
  authenticateWithBiometrics,
  getBiometricCapability,
} from '../../infra/device/biometric.service';
import { AppButton } from '../ui/AppButton';
import { AppConfirmDialog } from '../ui/AppConfirmDialog';
import { paperPalette, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/peripherals-diagnostic.styles';

interface PeripheralsDiagnosticModalProps {
  visible: boolean;
  onDismiss: () => void;
  profileName: string;
  onDeleteCurrentProfile?: () => Promise<void>;
  storageStats: {
    total: number;
    photosCount: number;
    photosSizeKb: number;
    locationsCount: number;
  };
}

const getPermissionBadgeStyle = (status: PermissionStatus) => {
  switch (status) {
    case PermissionStatus.GRANTED:
      return {
        label: 'Concedido',
        bg: semanticColors.successLight,
        color: semanticColors.success,
      };
    case PermissionStatus.DENIED:
      return {
        label: 'Denegado',
        bg: semanticColors.dangerLight,
        color: semanticColors.danger,
      };
    case PermissionStatus.UNAVAILABLE:
      return {
        label: 'No disponible',
        bg: paperPalette.paperLines,
        color: paperPalette.inkMedium,
      };
    default:
      return {
        label: 'Sin solicitar',
        bg: semanticColors.warningLight,
        color: semanticColors.warning,
      };
  }
};

export const PeripheralsDiagnosticModal: React.FC<PeripheralsDiagnosticModalProps> = ({
  visible,
  onDismiss,
  profileName,
  onDeleteCurrentProfile,
  storageStats,
}) => {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>(
    PermissionStatus.UNDETERMINED
  );
  const [biometric, setBiometric] = useState<IBiometricCapability>({
    available: false,
    hasHardware: false,
    isEnrolled: false,
    label: 'Verificando...',
  });

  const [lastGpsRead, setLastGpsRead] = useState<ITaskLocation | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isTestingGps, setIsTestingGps] = useState(false);
  const [biometricTestMessage, setBiometricTestMessage] = useState<string | null>(null);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  const refreshStatus = useCallback(async () => {
    const [cam, loc, bio] = await Promise.all([
      checkCameraPermission(),
      checkLocationPermission(),
      getBiometricCapability(),
    ]);
    setCameraStatus(cam);
    setLocationStatus(loc);
    setBiometric(bio);
  }, []);

  useEffect(() => {
    if (visible) {
      setGpsError(null);
      setBiometricTestMessage(null);
      refreshStatus();
    }
  }, [visible, refreshStatus]);

  const handleTestCameraPermission = async () => {
    const next = await requestCameraPermission();
    setCameraStatus(next);
  };

  const handleTestGps = async () => {
    setGpsError(null);
    setIsTestingGps(true);
    const result = await getCurrentLocation();
    setIsTestingGps(false);
    setLocationStatus(result.permissionStatus);

    if (result.success && result.data) {
      setLastGpsRead(result.data);
    } else if (result.error) {
      setGpsError(result.error);
    }
  };

  const handleTestBiometric = async () => {
    setBiometricTestMessage(null);
    const result = await authenticateWithBiometrics('Verificación de sensor biométrico');
    if (result.success) {
      setBiometricTestMessage('✓ Sensor biométrico verificado correctamente');
    } else if (result.error) {
      setBiometricTestMessage(result.error);
    }
  };

  const camBadge = getPermissionBadgeStyle(cameraStatus);
  const locBadge = getPermissionBadgeStyle(locationStatus);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Diagnóstico de Periféricos</Text>
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={22}
              color={semanticColors.success}
            />
          </View>
          <Text style={styles.subtitle}>
            Estado en tiempo real de permisos, sensores y almacenamiento local.
          </Text>

          <View style={styles.cardsStack}>
            <View style={styles.diagCard}>
              <View style={styles.diagCardHeader}>
                <View style={styles.diagTitleRow}>
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={18}
                    color={paperPalette.accentPrimary}
                  />
                  <Text style={styles.diagCardTitle}>Cámara y Optimización</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: camBadge.bg }]}>
                  <Text style={[styles.statusPillText, { color: camBadge.color }]}>
                    {camBadge.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.diagDetail}>
                Redimensionado automático a máx. 1080px (JPEG 70%) y guardado persistente en almacenamiento interno.
              </Text>
              <View style={styles.diagActionRow}>
                <Pressable onPress={handleTestCameraPermission} style={styles.testBtn}>
                  <MaterialCommunityIcons
                    name="check-decagram-outline"
                    size={14}
                    color={paperPalette.accentPrimary}
                  />
                  <Text style={styles.testBtnText}>Verificar permiso</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.diagCard}>
              <View style={styles.diagCardHeader}>
                <View style={styles.diagTitleRow}>
                  <MaterialCommunityIcons
                    name="map-marker-radius-outline"
                    size={18}
                    color={semanticColors.success}
                  />
                  <Text style={styles.diagCardTitle}>Geolocalización (GPS)</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: locBadge.bg }]}>
                  <Text style={[styles.statusPillText, { color: locBadge.color }]}>
                    {locBadge.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.diagDetail}>
                Captura explícita con validación de rango de coordenadas y precisión en metros.
              </Text>
              {lastGpsRead && (
                <Text style={styles.diagHighlight}>
                  {lastGpsRead.address ? `${lastGpsRead.address} • ` : ''}
                  {formatCoordinates(lastGpsRead.latitude, lastGpsRead.longitude)}
                  {lastGpsRead.accuracy !== null ? ` (±${lastGpsRead.accuracy} m)` : ''}
                </Text>
              )}
              {gpsError && (
                <Text style={[styles.diagDetail, { color: semanticColors.danger, marginTop: 4 }]}>
                  {gpsError}
                </Text>
              )}
              <View style={styles.diagActionRow}>
                <Pressable
                  onPress={handleTestGps}
                  style={styles.testBtn}
                  disabled={isTestingGps}
                >
                  {isTestingGps ? (
                    <ActivityIndicator size={14} color={paperPalette.accentPrimary} />
                  ) : (
                    <MaterialCommunityIcons
                      name="crosshairs-gps"
                      size={14}
                      color={paperPalette.accentPrimary}
                    />
                  )}
                  <Text style={styles.testBtnText}>
                    {isTestingGps ? 'Midiendo...' : 'Probar GPS'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.diagCard}>
              <View style={styles.diagCardHeader}>
                <View style={styles.diagTitleRow}>
                  <MaterialCommunityIcons
                    name="fingerprint"
                    size={18}
                    color={paperPalette.accentPrimary}
                  />
                  <Text style={styles.diagCardTitle}>Sensor Biométrico</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: biometric.available
                        ? semanticColors.successLight
                        : paperPalette.paperLines,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      {
                        color: biometric.available
                          ? semanticColors.success
                          : paperPalette.inkMedium,
                      },
                    ]}
                  >
                    {biometric.available ? biometric.label : 'No disponible'}
                  </Text>
                </View>
              </View>
              <Text style={styles.diagDetail}>
                Hardware detectado: {biometric.hasHardware ? 'Sí' : 'No'} • Enrolado:{' '}
                {biometric.isEnrolled ? 'Sí' : 'No'}
              </Text>
              {biometricTestMessage && (
                <Text style={styles.diagHighlight}>{biometricTestMessage}</Text>
              )}
              {biometric.available && (
                <View style={styles.diagActionRow}>
                  <Pressable onPress={handleTestBiometric} style={styles.testBtn}>
                    <MaterialCommunityIcons
                      name="fingerprint"
                      size={14}
                      color={paperPalette.accentPrimary}
                    />
                    <Text style={styles.testBtnText}>Probar sensor</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.diagCard}>
              <View style={styles.diagCardHeader}>
                <View style={styles.diagTitleRow}>
                  <MaterialCommunityIcons
                    name="database-check-outline"
                    size={18}
                    color={semanticColors.warning}
                  />
                  <Text style={styles.diagCardTitle}>Almacenamiento Local</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: semanticColors.successLight },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: semanticColors.success }]}>
                    Activo
                  </Text>
                </View>
              </View>
              <Text style={styles.diagDetail}>
                Perfil activo: {profileName} • {storageStats.total} tareas •{' '}
                {storageStats.photosCount} fotos ({storageStats.photosSizeKb} KB) •{' '}
                {storageStats.locationsCount} ubicaciones GPS.
              </Text>
              {onDeleteCurrentProfile && (
                <View style={styles.diagActionRow}>
                  <Pressable
                    onPress={() => setIsConfirmDeleteVisible(true)}
                    style={styles.testBtn}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={14}
                      color={semanticColors.danger}
                    />
                    <Text style={[styles.testBtnText, { color: semanticColors.danger }]}>
                      Eliminar mi perfil
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <AppButton label="Cerrar" onPress={onDismiss} variant="primary" compact />
          </View>
        </ScrollView>
      </Modal>

      <AppConfirmDialog
        visible={isConfirmDeleteVisible}
        title="¿Eliminar tu perfil?"
        message={`Se eliminará permanentemente el perfil "${profileName}" junto con todas sus tareas guardadas en este dispositivo.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDestructive
        loading={isDeletingProfile}
        onConfirm={async () => {
          if (!onDeleteCurrentProfile) return;
          setIsDeletingProfile(true);
          await onDeleteCurrentProfile();
          setIsDeletingProfile(false);
          setIsConfirmDeleteVisible(false);
          onDismiss();
        }}
        onCancel={() => setIsConfirmDeleteVisible(false)}
      />
    </Portal>
  );
};
