export type AuthUser = {
  sub: string;
  email: string;
  roles: string[];
  name: string;
  isSuperAdmin: boolean;
};

export type CurrentAuthUser = {
  id: string;
  email: string;
  roles: string[];
  name: string;
};
