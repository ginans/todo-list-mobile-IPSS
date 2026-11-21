import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IUserProfile } from '../../core/auth/interfaces/user-profile.interface';
import { CreateProfileInput } from '../../core/auth/types/create-profile.type';
import { IBiometricCapability } from '../../core/device/interfaces/peripheral-result.interface';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { APP_MESSAGES } from '../../constants/messages.constants';
import { paperPalette, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/profile-auth.styles';

interface ProfileAuthScreenProps {
  profiles: IUserProfile[];
  defaultProfileId?: string | null;
  biometricCapability: IBiometricCapability;
  authError: string | null;
  onCreateProfile: (input: CreateProfileInput) => Promise<boolean>;
  onUnlockWithPin: (profileId: string, pin: string) => Promise<boolean>;
  onUnlockWithBiometrics: (profile: IUserProfile) => Promise<boolean>;
  onClearError: () => void;
}

export const ProfileAuthScreen: React.FC<ProfileAuthScreenProps> = ({
  profiles,
  defaultProfileId,
  biometricCapability,
  authError,
  onCreateProfile,
  onUnlockWithPin,
  onUnlockWithBiometrics,
  onClearError,
}) => {
  const [isCreating, setIsCreating] = useState(profiles.length === 0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    defaultProfileId ?? profiles[0]?.id ?? null
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
      return;
    }

    const preferredId =
      defaultProfileId && profiles.some((p) => p.id === defaultProfileId)
        ? defaultProfileId
        : profiles[0].id;

    setSelectedProfileId((prev) =>
      prev && profiles.some((p) => p.id === prev) ? prev : preferredId
    );
  }, [profiles, defaultProfileId]);

  const biometricOwner = profiles.find((item) => item.biometricEnabled) ?? null;
  const canAssignBiometric = biometricCapability.available && !biometricOwner;
  const biometricIcon =
    biometricCapability.biometryType === 'facial' ? 'face-recognition' : 'fingerprint';

  useEffect(() => {
    setEnableBiometric(canAssignBiometric);
  }, [canAssignBiometric]);

  const selectedProfile =
    profiles.find((item) => item.id === selectedProfileId) ?? profiles[0] ?? null;

  const sanitizePin = (raw: string) => raw.replace(/[^0-9]/g, '').slice(0, 4);

  const handleCreateSubmit = async () => {
    setIsSubmitting(true);
    const ok = await onCreateProfile({
      name: newName,
      pin: newPin,
      biometricEnabled: canAssignBiometric && enableBiometric,
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
    setIsDropdownOpen(false);
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

            {canAssignBiometric ? (
              <View style={styles.biometricSwitchRow}>
                <View style={styles.biometricSwitchText}>
                  <Text style={styles.biometricSwitchTitle}>
                    Desbloqueo con {biometricCapability.label}
                  </Text>
                  <Text style={styles.biometricSwitchSubtitle}>
                    Vincula tu {biometricCapability.label.toLowerCase()} a este perfil principal.
                  </Text>
                </View>
                <Switch
                  value={enableBiometric}
                  onValueChange={setEnableBiometric}
                  color={paperPalette.accentPrimary}
                  disabled={isSubmitting}
                />
              </View>
            ) : biometricCapability.available && biometricOwner ? (
              <View style={styles.biometricSwitchRow}>
                <View style={styles.biometricSwitchText}>
                  <Text style={styles.biometricSwitchTitle}>Biometría exclusiva</Text>
                  <Text style={styles.biometricSwitchSubtitle}>
                    {APP_MESSAGES.AUTH.BIOMETRIC_OWNER_TAKEN(biometricOwner.name)}
                  </Text>
                </View>
              </View>
            ) : null}

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
            <Text style={styles.sectionLabel}>Perfil seleccionado</Text>

            {selectedProfile && (
              <View style={styles.dropdownWrapper}>
                <Pressable
                  onPress={() => {
                    if (profiles.length > 1) {
                      setIsDropdownOpen((prev) => !prev);
                    }
                  }}
                  style={styles.dropdownTrigger}
                  accessibilityRole="button"
                  accessibilityLabel="Seleccionar perfil"
                >
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: selectedProfile.avatarColor },
                    ]}
                  >
                    <Text style={styles.avatarInitial}>
                      {selectedProfile.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{selectedProfile.name}</Text>
                    <Text style={styles.profileHint}>
                      {selectedProfile.biometricEnabled && biometricCapability.available
                        ? `PIN o ${biometricCapability.label}`
                        : 'Protegido con PIN de 4 dígitos'}
                    </Text>
                  </View>

                  {profiles.length > 1 && (
                    <MaterialCommunityIcons
                      name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color={paperPalette.accentPrimary}
                    />
                  )}
                </Pressable>

                {isDropdownOpen && profiles.length > 1 && (
                  <View style={styles.dropdownMenu}>
                    {profiles.map((profile) => {
                      const isSelected = profile.id === selectedProfile.id;
                      return (
                        <Pressable
                          key={profile.id}
                          onPress={() => {
                            setSelectedProfileId(profile.id);
                            setIsDropdownOpen(false);
                            setUnlockPin('');
                            onClearError();
                          }}
                          style={[
                            styles.dropdownOption,
                            isSelected && styles.dropdownOptionSelected,
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
                          </View>

                          {isSelected && (
                            <MaterialCommunityIcons
                              name="check"
                              size={18}
                              color={paperPalette.accentPrimary}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

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
                      icon={biometricIcon}
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
