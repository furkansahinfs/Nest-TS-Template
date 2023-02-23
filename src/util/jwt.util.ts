import { sign, SignOptions, verify } from "jsonwebtoken";

export const verifyToken = (
  token: string,
  keyName: "ACCESS_TOKEN_PRIVATE_KEY" | "REFRESH_TOKEN_PRIVATE_KEY",
) => {
  const publicKey = Buffer.from(process.env[keyName], "base64").toString(
    "ascii",
  );

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

export function generateAccessToken(
  user: { email: string; userId: string },
  keyName: "ACCESS_TOKEN_PRIVATE_KEY" | "REFRESH_TOKEN_PRIVATE_KEY",
  options?: SignOptions | undefined,
) {
  const signingKey = Buffer.from(process.env[keyName], "base64").toString(
    "ascii",
  );

  return sign(user, signingKey, {
    ...options,
    expiresIn: process.env.ACCESS_TOKEN_TIME,
    algorithm: "RS256",
  });
}

export function getUserName(req) {
  return verify(
    req.headers["authorization"].split(" ")[1],
    process.env.JWT_SECRET,
  )["username"];
}

export function getUserId(req) {
  return verify(
    req.headers["authorization"].split(" ")[1],
    process.env.JWT_SECRET,
  )["userId"];
}
