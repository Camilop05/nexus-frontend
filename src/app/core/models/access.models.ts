import type { UserRole } from './user.models';

export type AccessZone = {
  id: string;
  name: string;
  description: string | null;
  minRole: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateZoneRequest = {
  name: string;
  description?: string;
  minRole: UserRole;
  isActive?: boolean;
};

export type UpdateZoneRequest = Partial<CreateZoneRequest>;

export type EnterZoneResponse = {
  granted: boolean;
  reason: string;
  log: AccessLog;
};

export type AccessLog = {
  id: string;
  userId: string;
  zoneId: string;
  granted: boolean;
  attemptedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  zone?: {
    id: string;
    name: string;
    minRole: UserRole;
  };
};
