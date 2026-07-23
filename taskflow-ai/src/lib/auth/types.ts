export type LoginUser = {
  id: string;
  email: string;
};

export type LoginSuccess = {
  token: string;
  user: LoginUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};
