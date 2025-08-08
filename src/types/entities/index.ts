import { Document } from 'mongoose';

export interface IForgotPassword extends Document {
  email: string;
  verification?: string;
  used: boolean;
  ipRequest?: string;
  browserRequest?: string;
  countryRequest?: string;
  ipChanged?: string;
  browserChanged?: string;
  countryChanged?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAccess extends Document {
  email: string;
  ip: string;
  browser: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends Document {
  _id: string;
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'SUPERADMIN';
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
