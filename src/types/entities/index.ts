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
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAccess {
  id: number;
  email: string;
  ip: string;
  browser: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}
