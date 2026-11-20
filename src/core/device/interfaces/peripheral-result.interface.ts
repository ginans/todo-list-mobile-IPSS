import { PermissionStatus } from '../enums/permission-status.enum';
import { ITaskLocation } from '../../task/interfaces/task-location.interface';

export interface IPhotoCaptureData {
  uri: string;
  width: number;
  height: number;
  sizeKb: number;
}

export interface IPeripheralResult<T> {
  success: boolean;
  data?: T;
  permissionStatus: PermissionStatus;
  canceled?: boolean;
  error?: string;
}

export interface IBiometricCapability {
  available: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  label: string;
}

export interface ILocationDiagnostic {
  permissionStatus: PermissionStatus;
  location?: ITaskLocation;
  error?: string;
}
