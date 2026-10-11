export interface IJwtPayload {
  userId: string;
  email: string;
  isSuperAdmin?: boolean;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IUserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  nid?: string | null;
  designation?: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
