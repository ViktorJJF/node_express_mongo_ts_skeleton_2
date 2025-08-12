export interface IForgotPassword {
  id: number;
  email: string;
  verification?: string;
  used: boolean;
  ipRequest?: string;
  browserRequest?: string;
  countryRequest?: string;
  ipChanged?: string;
  browserChanged?: string;
  countryChanged?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserAccess {
  id: number;
  email: string;
  ip: string;
  browser: string;
  country: string;
  created_at: Date;
  updated_at: Date;
}
