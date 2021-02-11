import {Exception} from './Exception';

export class ResourceNotFoundException extends Exception {
  status = 404;
  constructor(message = 'Resource not found') {
    super('ResourceNotFoundException', message);
  }
}
