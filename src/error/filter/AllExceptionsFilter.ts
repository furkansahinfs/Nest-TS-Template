import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { ResponseBody } from "src/util";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception, host: ArgumentsHost) {
    const res = host.switchToHttp();
    const response = res.getResponse();

    if (exception?.message === "Forbidden resource") {
      response
        .status(HttpStatus.FORBIDDEN)
        .json(
          ResponseBody()
            .status(HttpStatus.FORBIDDEN)
            .message({ error: exception.message })
            .build(),
        );
    } else {
      response.status(exception?.statusCode || HttpStatus.BAD_REQUEST).json(
        ResponseBody()
          .status(exception?.statusCode || HttpStatus.BAD_REQUEST)
          .message(exception?.response?.message ?? { error: exception })
          .build(),
      );
    }
  }
}
