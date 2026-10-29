export class AppError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}
export class ValidationError extends AppError { constructor(m) { super(400, m); } }
export class NotFoundError  extends AppError { constructor(m) { super(404, m); } }
export class ConflictError  extends AppError { constructor(m) { super(409, m); } }