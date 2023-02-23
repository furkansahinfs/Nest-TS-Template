export type RegisterDTO = {
  email: string;
  password: string;
};

export type TokenDTO = {
  email: string;
  password: string;
  granty_type: string;
  refresh_token?: string;
};
