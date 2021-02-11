export const buildResponse = (statusCode: number, data: Record<string, any>) => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data)
  }
};
