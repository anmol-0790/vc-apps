export type AuthUser = {
  id: string;
  email: string;
};

/** Session payload returned by login/register APIs. */
export type AuthSuccess = {
  token: string;
  user: AuthUser;
};

/** @deprecated Prefer AuthSuccess — kept for existing imports. */
export type LoginSuccess = AuthSuccess;

/** @deprecated Prefer AuthUser */
export type LoginUser = AuthUser;

export type LoginCredentials = {
  email: string;
  password: string;
};
