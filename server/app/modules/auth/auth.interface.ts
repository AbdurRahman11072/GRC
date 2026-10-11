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

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IUserOrgMembership {
  orgId: string;
  orgName: string;
  orgRole: string;
}

export interface ILoginResponse {
  user: IUserProfile;
  organizations: IUserOrgMembership[];
  tokens: IAuthTokens;
}

export interface IProvisionUserPayload {
  orgId: string;
  name: string;
  email: string;
  password: string;
  orgRole: 'ADMIN' | 'AUDITOR' | 'MEMBER';
  phone?: string;
  nid?: string;
  designation?: string;
}

export interface IProvisionUserResponse {
  user: IUserProfile;
  membership: {
    orgId: string;
    orgRole: string;
    isExistingUser: boolean;
  };
}

