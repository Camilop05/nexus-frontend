export type UserRole = 'ADMIN' | 'USER' | 'SUPERVISOR';
export type DocumentType = 'CC' | 'CE' | 'TI' | 'PASAPORTE';

// Usuario público que devuelve el backend.
// No contiene passwordHash porque ese dato no debe llegar al frontend.
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  nationality: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Datos para crear usuarios desde Angular.
export type CreateUserRequest = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  nationality: string;
  password: string;
  role?: UserRole;
};

// Datos para actualizar usuarios.
export type UpdateUserRequest = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  nationality?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
};

// Mapeo visual de roles técnicos a nombres temáticos de Nexus.
// El backend y la base de datos siguen usando ADMIN/USER/SUPERVISOR.
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Comandante',
  SUPERVISOR: 'Oficial de turno',
  USER: 'Tripulante',
};

// Tipos de documento, con etiqueta legible para selects.
export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];
