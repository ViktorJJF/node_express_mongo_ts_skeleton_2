export interface IUser {
  id: number;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin' | 'developer' | 'agent' | 'owner';
  verification?: string;
  verified: boolean;
  phone?: string;
  city?: string;
  country?: string;
  urlTwitter?: string;
  urlGitHub?: string;
  loginAttempts: number;
  blockExpires: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
