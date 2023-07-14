import { conf } from "src/config";

export const ROLES = {
  ADMIN: conf.ROLE_KEY?.concat("ADMIN"),
  CT_ADMIN: conf.ROLE_KEY?.concat("CT_ADMIN"),
  USER: conf.ROLE_KEY?.concat("USER"),
};
