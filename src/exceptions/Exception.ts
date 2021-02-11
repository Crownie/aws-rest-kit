export class Exception {
  public status = 500;

  constructor(public readonly name='InternalServerError', public readonly message='Unexpected error') {
  }

  toResponseData(): any {
    return {
      type: this.name,
      message: this.message,
    };
  }
}
