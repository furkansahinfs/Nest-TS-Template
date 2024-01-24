import { compare, hash } from "bcrypt";

export async function encryptPassword(password: string) {
  return hash(password, 3)
    .then((hashedPassword) => {
      return hashedPassword;
    })
    .catch((e) => {
      console.log(e);
      return "ERROR";
    });
}

export async function comparePassword(plainPass, hashword) {
  return compare(plainPass, hashword).then((matched) => matched);
}
