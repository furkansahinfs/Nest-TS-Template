export type RegisterDTO = {
  username: string;
  password: string;
};

export type TokenDTO = {
  username: string;
  password: string;
  granty_type: string;
  refresh_token?: string;
};
