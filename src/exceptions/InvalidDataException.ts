import {Exception} from './Exception';

export class InvalidDataException extends Exception {
  status = 400;

  constructor(message: string, private fieldErrors?: {[key: string]: string}) {
    super('InvalidDataException', message);
  }

  getFieldErrors(): {[key: string]: string} {
    return this.fieldErrors;
  }

  public toResponseData(): any {
    return {
      ...super.toResponseData(),
      fieldErrors: this.fieldErrors,
    };
  }
}
