export class ValidationError extends Error {
  constructor(message, field = 'formula', position = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.position = position;
  }
}
