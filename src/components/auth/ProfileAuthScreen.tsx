import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IUserProfile } from '../../core/auth/interfaces/user-profile.interface';
import { CreateProfileInput } from '../../core/auth/types/create-profile.type';
import { IBiometricCapability } from '../../core/device/interfaces/peripheral-result.interface';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { paperPalette, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/profile-auth.styles';

interface ProfileAuthScreenProps {
  profiles: IUserProfile[];
  biometricCapability: IBiometricCapability;
  authError: string | null;
  onCreateProfile: (input: CreateProfileInput) => Promise<boolean>;
  onUnlockWithPin: (profileId: string, pin: string) => Promise<boolean>;
  onUnlockWithBiometrics: (profile: IUserProfile) => Promise<boolean>;
  onClearError: () => void;
}

export const ProfileAuthScreen: React.FC<ProfileAuthScreenProps> = ({
  profiles,
  biometricCapability,
  authError,
  onCreateProfile,
  onUnlockWithPin,
  onUnlockWithBiometrics,
  onClearError,
}) => {
  const [isCreating, setIsCreating] = useState(profiles.length === 0);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles[0]?.id ?? null
  );

  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(biometricCapability.available);
  const [unlockPin, setUnlockPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profiles.length === 0) {
      setIsCreating(true);
      setSelectedProfileId(null);
    } else if (!selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  useEffect(() => {
    setEnableBiometric(biometricCapability.available);
  }, [biometricCapability.available]);

  const selectedProfile =
    profiles.find((item) => item.id === selectedProfileId) ?? profiles[0] ?? null;

  const sanitizePin = (raw: string) => raw.replace(/[^0-9]/g, '').slice(0, 4);

  const handleCreateSubmit = async () => {
    setIsSubmitting(true);
    const ok = await onCreateProfile({
      name: newName,
      pin: newPin,
      biometricEnabled: biometricCapability.available && enableBiometric,
    });
    setIsSubmitting(false);
    if (ok) {
      setNewName('');
      setNewPin('');
      setIsCreating(false);
    }
  };

  const handleUnlockPinSubmit = async () => {
    if (!selectedProfile) return;
    setIsSubmitting(true);
    const ok = await onUnlockWithPin(selectedProfile.id, unlockPin);
    setIsSubmitting(false);
    if (ok) {
      setUnlockPin('');
    }
  };

  const handleBiometricPress = async () => {
    if (!selectedProfile) return;
    setIsSubmitting(true);
    await onUnlockWithBiometrics(selectedProfile);
    setIsSubmitting(false);
  };

  const switchMode = (createMode: boolean) => {
    onClearError();
    setUnlockPin('');
    setNewName('');
    setNewPin('');
    setIsCreating(createMode);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.brandHeader}>
          <View style={styles.brandIconBox}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={30}
              color={paperPalette.accentPrimary}
            />
          </View>
          <Text style={styles.brandTitle}>Mis Tareas</Text>
          <Text style={styles.brandSubtitle}>
            {isCreating
              ? 'Crea un perfil local para guardar tus tareas, fotos y ubicaciones de forma privada.'
              : 'Selecciona tu cuaderno e ingresa tu PIN de 4 dígitos para continuar.'}
          </Text>
        </View>

        {authError && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={18}
              color={semanticColors.danger}
            />
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        {isCreating ? (
          <View>
            <Text style={styles.sectionLabel}>Nuevo Perfil</Text>

            <AppInput
              label="Nombre del perfil *"
              placeholder="Ej: Gina"
              value={newName}
              onChangeText={(text) => {
                setNewName(text);
                if (authError) onClearError();
              }}
              maxLength={24}
              disabled={isSubmitting}
            />

            <AppInput
              label="PIN de 4 dígitos *"
              placeholder="Ej: 1234"
              value={newPin}
              onChangeText={(text) => {
                setNewPin(sanitizePin(text));
                if (authError) onClearError();
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              disabled={isSubmitting}
            />

            {biometricCapability.available && (
              <View style={styles.biometricSwitchRow}>
                <View style={styles.biometricSwitchText}>
                  <Text style={styles.biometricSwitchTitle}>
                    Desbloqueo con {biometricCapability.label}
                  </Text>
                  <Text style={styles.biometricSwitchSubtitle}>
                    Permite abrir este perfil sin escribir el PIN.
                  </Text>
                </View>
                <Switch
                  value={enableBiometric}
                  onValueChange={setEnableBiometric}
                  color={paperPalette.accentPrimary}
                  disabled={isSubmitting}
                />
              </View>
            )}

            <View style={styles.primaryActions}>
              <AppButton
                label="Crear y Abrir Cuaderno"
                onPress={handleCreateSubmit}
                variant="primary"
                icon="check"
                loading={isSubmitting}
              />
            </View>

            {profiles.length > 0 && (
              <View style={styles.footerDivider}>
                <AppButton
                  label="Volver a mis perfiles"
                  onPress={() => switchMode(false)}
                  variant="ghost"
                  compact
                  disabled={isSubmitting}
                />
              </View>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionLabel}>Perfiles guardados</Text>

            <View style={styles.profilesList}>
              {profiles.map((profile) => {
                const isSelected = selectedProfile?.id === profile.id;
                return (
                  <Pressable
                    key={profile.id}
                    onPress={() => {
                      setSelectedProfileId(profile.id);
                      setUnlockPin('');
                      onClearError();
                    }}
                    style={[
                      styles.profileItem,
                      isSelected && styles.profileItemSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCircle,
                        { backgroundColor: profile.avatarColor },
                      ]}
                    >
                      <Text style={styles.avatarInitial}>
                        {profile.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.profileInfo}>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileHint}>
                        {profile.biometricEnabled && biometricCapability.available
                          ? `PIN o ${biometricCapability.label}`
                          : 'Protegido con PIN de 4 dígitos'}
                      </Text>
                    </View>

                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color={paperPalette.accentPrimary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>

            {selectedProfile && (
              <View style={styles.unlockBox}>
                <AppInput
                  label={`PIN de ${selectedProfile.name}`}
                  placeholder="Ingresa 4 dígitos"
                  value={unlockPin}
                  onChangeText={(text) => {
                    setUnlockPin(sanitizePin(text));
                    if (authError) onClearError();
                  }}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  disabled={isSubmitting}
                />

                <View style={styles.primaryActions}>
                  <AppButton
                    label="Desbloquear con PIN"
                    onPress={handleUnlockPinSubmit}
                    variant="primary"
                    icon="lock-open-outline"
                    loading={isSubmitting}
                  />

                  {biometricCapability.available && selectedProfile.biometricEnabled && (
                    <AppButton
                      label={`Usar ${biometricCapability.label}`}
                      onPress={handleBiometricPress}
                      variant="outline"
                      icon="fingerprint"
                      disabled={isSubmitting}
                    />
                  )}
                </View>
              </View>
            )}

            <View style={styles.footerDivider}>
              <AppButton
                label="Crear nuevo perfil"
                onPress={() => switchMode(true)}
                variant="ghost"
                icon="account-plus-outline"
                compact
                disabled={isSubmitting}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
