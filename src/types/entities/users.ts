export interface IUser {
  id: number;
  firstname: string;
  lastname?: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin' | 'developer' | 'agent' | 'owner';
  verification?: string;
  verified: boolean;
  phone?: string;
  city?: string;
  country?: string;
  url_twitter?: string;
  url_github?: string;
  login_attempts: number;
  block_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}
