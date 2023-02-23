import { HttpStatus } from "@nestjs/common";

export interface ResponseBodyProps {
  status: HttpStatus;
  message: any;
  data: any;
}
export function ResponseBody() {
  const response: ResponseBodyProps = {
    status: HttpStatus.OK,
    message: undefined,
    data: undefined,
  };

  return {
    status: function (status: HttpStatus) {
      response.status = status;
      return this;
    },
    message: function (message: any) {
      response.message = message;
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
