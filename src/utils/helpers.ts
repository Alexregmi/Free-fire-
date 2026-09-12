import { AlertNotification } from '../types';

export function createAlert(
  type: AlertNotification['type'],
  title: string,
  message: string
): AlertNotification {
  return {
    id: 'alert-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    type,
    title,
    message,
  };
}

export function formatRuntime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

export function formatLogTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

export function validateUid(uid: string): { valid: boolean; reason?: string } {
  const trimmed = uid.trim();
  if (!trimmed) {
    return { valid: false, reason: 'UID cannot be empty.' };
  }
  // Free Fire UIDs are typically 8 to 12 digits
  if (!/^\d{8,12}$/.test(trimmed)) {
    return { 
      valid: false, 
      reason: 'Invalid UID format. Free Fire UID must be 8 to 12 numeric digits (e.g., 1029384756).' 
    };
  }
  return { valid: true };
}

export function validateRegion(regionCode: string, validCodes: string[]): boolean {
  return validCodes.includes(regionCode);
}
