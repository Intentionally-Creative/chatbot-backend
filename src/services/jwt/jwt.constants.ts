import { envVariables } from "../../env-config.js";

export const JWT_SECRET = envVariables.JWT_SECRET;
// export const JWT_ACCESS_TOKEN_EXPIRATION = 60 * 15; // 15 minutes;
export const JWT_ACCESS_TOKEN_EXPIRATION = 60 * 60 * 24 * 7; // 7 days;
export const JWT_REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 1; // 1 day;
export const JWT_REFRESH_TOKEN_EXPIRATION_EXTENDED = 60 * 60 * 24 * 7; // 7 days;
