import { HttpStatus } from "@nestjs/common";
import { NotFoundError } from "@prisma/client/runtime/index.js";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "src/error/";
import { Request, Response } from "express";
import { ResponseBodyProps } from "../util";

const handleResponse = (res: Response, response: ResponseBodyProps) =>
  res.status(response.status).send(response);

const handleError = (req: Request, res: Response, err: Error) => {
  if (err instanceof UnauthorizedError) {
    res.status(err?.status || HttpStatus.UNAUTHORIZED).send({
      message: { error: "You are unauthorized to reach that context" },
    });
  } else if (err instanceof NotFoundError) {
    res
      .status(HttpStatus.NOT_FOUND)
      .send({ message: { error: "Content not found" } });
  } else if (err instanceof jwt.JsonWebTokenError) {
    res.status(HttpStatus.FORBIDDEN).send({
      message: { error: "You lack permissions to reach that context" },
    });
  } else {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      message: { error: "Unhandled error occured, Please contact with us" },
    });
  }
};

export function promiseMiddleware() {
  return (req: Request, res: Response, next) => {
    res["promise"] = (p) => {
      let promiseToResolve;
      if (p.then && p.catch) {
        promiseToResolve = p;
      } else if (typeof p === "function") {
        promiseToResolve = Promise.resolve().then(() => p());
      } else {
        promiseToResolve = Promise.resolve(p);
      }

      return promiseToResolve
        .then((response: ResponseBodyProps) => handleResponse(res, response))
        .catch((e: Error) => handleError(req, res, e));
    };

    return next();
  };
}
