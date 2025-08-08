import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  role: 'admin' | 'superadmin' | 'developer' | 'agent' | 'owner';
  verification?: string;
  verified: boolean;
  phone?: string;
  city?: string;
  country?: string;
  urlTwitter?: string;
  urlGitHub?: string;
  loginAttempts: number;
  blockExpires: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(passwordAttempt: string): Promise<boolean>;
}

export interface IUserDocument extends IUser {
  // Additional methods if any
}
