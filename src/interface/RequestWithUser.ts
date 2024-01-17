import { Request } from "express";
import { User } from "src/types";

export interface RequestWithUser extends Request {
  user?: User;
}
