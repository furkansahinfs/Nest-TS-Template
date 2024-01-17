import { HttpStatus } from "@nestjs/common";
import { IResponse, ResponseMessage } from "src/types";

export function ResponseBody() {
  const response: IResponse = {
    status: HttpStatus.OK,
    success: true,
    message: undefined,
    data: undefined,
  };

  return {
    status: function (status: HttpStatus) {
      response.status = status;
      return this;
    },
    message: function (message: any) {
      response.message = generateBodyMessage(message);
      response.success = false;
      return this;
    },
    data: function (data: any) {
      response.data = data;
      return this;
    },
    build: function () {
      return response;
    },
  };
}

const generateBodyMessage = (message: any): ResponseMessage => {
  if (message?.error) {
    return generateErrorObject(message.error);
  }

  return { error: message };
};

const generateErrorObject = (error: any): ResponseMessage => {
  console.log("err", error);
  const conditions = [
    {
      // holding validation errors
      check: () => Array.isArray(error),
      result: { error: error.toString() },
    },
    {
      // holding person defined errors
      check: () => typeof error === "string",
      result: { error },
    },
    {
      // holding CT errors
      check: () => typeof error === "object",
      result: { error: error.message, stack: error },
    },
  ];

  for (const condition of conditions) {
    if (condition.check()) {
      return condition.result;
    }
  }

  return { error };
};
