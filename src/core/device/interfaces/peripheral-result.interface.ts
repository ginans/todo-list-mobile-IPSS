import { PermissionStatus } from '../enums/permission-status.enum';

export interface IPhotoCaptureData {
  uri: string;
  fileName: string;
  width: number;
  height: number;
  sizeKb: number;
}

export interface IPeripheralResult<T> {
  success: boolean;
  data?: T;
  permissionStatus: PermissionStatus;
  canAskAgain?: boolean;
  canceled?: boolean;
  error?: string;
}

export type BiometryType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface IBiometricCapability {
  available: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  biometryType: BiometryType;
  label: string;
}
