import { Request } from "express";
import { IUser } from "../modules/user/user.model.js";

export function getAuthUserData(req: Request) {
  //@ts-ignore
  return req.user as IUser;
}
