export class UnauthorizedError extends Error {
  status: number;
  constructor() {
    super();

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
