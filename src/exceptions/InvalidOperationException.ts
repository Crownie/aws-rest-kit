import {Exception} from './Exception';

export class InvalidOperationException extends Exception {
  constructor(
    message: string = 'this operation cannot be performed due to the state of the data',
  ) {
    super('InvalidOperationException', message);
  }
}
