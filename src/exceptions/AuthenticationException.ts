import {Exception} from './Exception';

export class AuthenticationException extends Exception {
  status = 401;
  constructor(message: string = 'Invalid login credentials') {
    super('AuthenticationException', message);
  }
}
