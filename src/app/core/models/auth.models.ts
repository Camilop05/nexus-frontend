// Datos que enviamos al endpoint POST /api/v1/auth/login.
export type LoginRequest = {
  email: string;
  password: string;
};

// Tipos de documento de identidad soportados en el registro.
export type DocumentType = 'CC' | 'CE' | 'TI' | 'PASAPORTE';

// Datos que enviamos al endpoint POST /api/v1/auth/register.
export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  nationality: string;
  password: string;
};

// Respuesta que devuelve el backend al hacer login o registro.
export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
};

// Perfil completo que devuelve GET /api/v1/auth/me.
export type AuthenticatedUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentType: DocumentType;
  documentNumber: string;
  nationality: string;
  role: 'ADMIN' | 'USER' | 'SUPERVISOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Etiquetas temáticas para el tipo de documento (solo presentación).
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  TI: 'Tarjeta de identidad',
  PASAPORTE: 'Pasaporte',
};
