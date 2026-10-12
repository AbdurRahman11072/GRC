export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
    [key: string]: unknown;
  };
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
  createdAt: string;
  updatedAt: string;
}

export interface IUserOrgMembership {
  orgId: string;
  orgName: string;
  orgRole: 'OWNER' | 'ADMIN' | 'AUDITOR' | 'MEMBER' | string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  nid?: string;
  designation?: string;
  organization?: {
    orgName: string;
    orgType: string;
    orgAddress?: string;
    orgPhone?: string;
    orgEmail?: string;
    orgWebsite?: string;
    numberOfEmployee?: number;
  };
}

export interface ILoginResponseData {
  user: IUserProfile;
  organizations: IUserOrgMembership[];
  accessToken: string;
}

export interface IRegisterResponseData {
  user: IUserProfile;
  organization?: {
    id: string;
    orgName: string;
    orgType: string;
    role: string;
  };
  accessToken: string;
}

export interface IRefreshResponseData {
  accessToken: string;
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

export interface IProvisionUserResponseData {
  user: IUserProfile;
  membership: {
    orgId: string;
    orgRole: string;
    isExistingUser: boolean;
  };
}

export interface IUpdateMePayload {
  name?: string;
  phone?: string;
  nid?: string;
  designation?: string;
}
