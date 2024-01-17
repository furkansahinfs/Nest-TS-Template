import { sign, SignOptions, verify } from "jsonwebtoken";
import { conf } from "src/config";

export const verifyToken = (
  token: string,
  keyName: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_TOKEN_PUBLIC_KEY",
) => {
  const publicKey = Buffer.from(conf[keyName], "base64").toString("ascii");

  try {
    const decoded = verify(token, publicKey);

    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
};

export function generateToken(
  user: { username: string; userId: string },
  keyName: "ACCESS_TOKEN_PRIVATE_KEY" | "REFRESH_TOKEN_PRIVATE_KEY",
  options?: SignOptions | undefined,
) {
  const signingKey = Buffer.from(conf[keyName], "base64").toString("ascii");

  return sign(user, signingKey, {
    ...options,
    algorithm: "RS256",
    allowInsecureKeySizes: true,
  });
}

export function getJWTUsername(
  token: string,
  keyName: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_TOKEN_PUBLIC_KEY",
) {
  const signingKey = Buffer.from(conf[keyName], "base64").toString("ascii");
  const user = verify(token, signingKey);
  return user?.["username"];
}

export function getJWTUserId(
  token: string,
  keyName: "ACCESS_TOKEN_PUBLIC_KEY" | "REFRESH_TOKEN_PUBLIC_KEY",
) {
  const signingKey = Buffer.from(conf[keyName], "base64").toString("ascii");
  return verify(token, signingKey)["userId"];
}
