import {AuthenticationException, GatewayHandler} from '../src';
import {APIGatewayEvent} from 'aws-lambda';

const dummyData = {message: 'Hello!'};

it('returns correct response', async () => {
  const event = {
    body: JSON.stringify(dummyData),
  };
  const handler = new GatewayHandler(async ({body}) => {
    return body;
  }).execute();
  const response = await handler(event, {} as any, jest.fn());
  expect(response).toEqual({
    body: event.body,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
  });
});

it('returns error response', async () => {
  const event = {
    body: JSON.stringify(dummyData),
  };
  const handler1 = new GatewayHandler(async ({body}) => {
    throw new Error('broken!');
  }).execute();
  const response = await handler1(event, {} as any, jest.fn());
  expect(response).toEqual({
    body: '{}',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 500,
  });
});

it('returns exception response', async () => {
  const event = {
    body: JSON.stringify(dummyData),
  };
  const handler1 = new GatewayHandler(async ({body}) => {
    throw new AuthenticationException();
  }).execute();
  const response = await handler1(event, {} as any, jest.fn());
  expect(response).toEqual({
    body:
      '{"type":"AuthenticationException","message":"Invalid login credentials"}',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 401,
  });
});

it('receives pathParameters and querStringParameters', async () => {
  const event: Partial<APIGatewayEvent> = {
    pathParameters: {id: 'dummy-id'},
    queryStringParameters: {page: '1'},
  };
  const handler1 = new GatewayHandler(async ({pathParams, queryParams}) => {
    return {pathParams, queryParams};
  }).execute();
  const response = await handler1(event, {} as any, jest.fn());
  expect(response).toEqual({
    body: '{"pathParams":{"id":"dummy-id"},"queryParams":{"page":"1"}}',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
  });
});
