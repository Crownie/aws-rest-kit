import {APIGatewayEvent, APIGatewayProxyResult, Callback, Context, Handler} from 'aws-lambda';
import {buildResponse} from './utils';
import {Exception} from './exceptions/Exception';

type ErrorHandler = (error: Exception | Error) => APIGatewayProxyResult;

export interface RequestData {
  body?: Record<string, any> | string | number | null;
  pathParams: Record<string, any>;
  queryParams: Record<string, any>;
}

export interface OriginalRequest {
  event: APIGatewayEvent;
  context: Context;
  callback: Callback<any>;
}

export type RequestHandler = (
  request: RequestData,
  original: OriginalRequest,
) => Promise<any>;

/**
 * An helper class which abstracts the aws lambda handler
 */
export class GatewayHandler {
  private readonly handler: RequestHandler;
  private before_handler: RequestHandler;
  private error_handler: ErrorHandler;
  private after_handler: RequestHandler;

  constructor(handler: RequestHandler) {
    this.handler = handler;
  }

  /*
   * Register a middleware function that should run before the main handler
   * */
  before(func: RequestHandler) {
    this.before_handler = func;
    return this;
  }

  /*
   * Register a middleware function that should run after the main handler
   * */
  after(func: RequestHandler) {
    this.after_handler = func;
    return this;
  }

  /*
   * Register an onError
   * */
  onError(func: ErrorHandler) {
    this.error_handler = func;
    return this;
  }

  private async runBeforeHandlers(event, context, callback) {
    if (this.before_handler) {
      const original = {event, context, callback};
      const request = this.parseRequest(event);
      await this.before_handler(request, original);
    }
  }

  private async runHandler(event, context, callback) {
    let data = await this.handler(this.parseRequest(event), {
      event,
      context,
      callback,
    });
    return buildResponse(200, data);
  }

  private async runErrorHandler(error: Exception | Error) {
    let response;
    try {
      if (this.error_handler) {
        response = await this.error_handler(error);
      } else if(error instanceof Exception) {
        response =buildResponse(error.status || 500, error.toResponseData());
      }else{
        console.log(error);
        response = buildResponse(500, error);
      }
    } catch (e) {
      console.log(error);
      response = buildResponse(500, e);
    }
    return response;
  }

  private async runAfterHandlers(event, context, callback) {
    if (this.after_handler) {
      await this.after_handler(this.parseRequest(event), {
        event,
        context,
        callback,
      });
    }
  }

  execute(): Handler {
    return async (event, context, callback) => {
      if (context) {
        /*
    Tell lambda to stop when I issue the callback.
    This is super important or the lambda funciton will always go until it hits the timeout limit you set.
    */
        context['callbackWaitsForEmptyEventLoop'] = false; //life saver
      }
      let response;
      try {
        await this.runBeforeHandlers(event, context, callback);
        response = await this.runHandler(event, context, callback);
        await this.runAfterHandlers(event, context, callback);
      } catch (error) {
        response = await this.runErrorHandler(error);
      }
      return response;
    };
  }

  private parseRequest(event: any) {
    let body = event.body;
    try {
      body = body ? JSON.parse(event.body) : body;
    } catch (e) {
      console.log(`Failed to parse the body as JSON. It is now reverted to original. [${typeof body}]`);
      console.log(e);
    }
    const pathParams = event.pathParameters || {};
    const queryParams = event.queryStringParameters || {};
    return {body, pathParams, queryParams};
  }
}
