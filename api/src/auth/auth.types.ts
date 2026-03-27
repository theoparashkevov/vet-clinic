import { UserRole } from './roles.constants';

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

export type CurrentAuthUser = {
  id: string;
  email: string;
  role: UserRole;
  name: string;
};
