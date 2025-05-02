import { asyncWrapper } from "../utils/async-wrapper.js";
import { CustomError } from "../utils/custom-error.js";
import { getAuthUserData } from "../utils/get-auth-user-data.js";

export const isAdmin = asyncWrapper(async (req: any, _: any, next: any) => {
  const user = getAuthUserData(req);
  if (!user) next(new CustomError("Unauthenticated", 401));

  if (user.role !== "admin") {
    next(new CustomError("Unauthorized", 401));
  }

  next();
});
