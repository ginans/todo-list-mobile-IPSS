export interface ITaskLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  address?: string;
  capturedAt: string;
}
