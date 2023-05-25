export const TestCases: Record<string, Record<string, string>> = {
  "nodejs14.x": {
    crud: `const { lambdaHandler } = require("../../app");
    const aws = require('aws-sdk');
    
    
    const dynamoDB = new aws.DynamoDB.DocumentClient();
    jest.mock("aws-sdk", () => {
      const mockDB = {
        get: { promise: jest.fn() },
        put: { promise: jest.fn() },
        delete: { promise: jest.fn() }
      };
      return {
        DynamoDB: {
          DocumentClient: jest.fn().mockImplementation(() => {
            return {
              get: () => mockDB.get,
              put: () => mockDB.put,
              delete: () => mockDB.delete
            };
          })
        }
      };
    });
    
    
    describe('lambdaHandler', () => {
      let event;
      let context;
    
      beforeEach(() => {
        event = {}; // Set your desired event data
        context = {}; // Set your desired context data
      });
    
     
    
      it('should return a successful response for POST method', async () => {
        event.httpMethod = 'POST';
        event.body = JSON.stringify({ id: 'ID' });
        const expectedResponse = {
          statusCode: 200,
          body: JSON.stringify({
            data: { message: 'data updated' },
          }),
        };
    
        dynamoDB.put().promise.mockReturnValueOnce({ message: 'data updated' } )
    
        const response = await lambdaHandler(event, context);
        console.log(JSON.stringify(response))
        expect(response).toEqual(expectedResponse);
        
      });
    
    it('should return a successful response for GET method', async () => {
      event.httpMethod = 'GET';
      event.pathParameters = { id: 'ID' };
      const expectedResponse = {
        statusCode: 200,
        body: JSON.stringify({
          data: { message: 'data retrieved' },
        }),
      };
    
      dynamoDB.get().promise.mockReturnValueOnce({ message: 'data retrieved' } )
    
    
    
      const response = await lambdaHandler(event, context);
    
      expect(response).toEqual(expectedResponse);
    });
    
    
      it('should return a successful response for PUT method', async () => {
        event.httpMethod = 'PUT';
        event.body = JSON.stringify({ id: 'exampleId' });
        const expectedResponse = {
          statusCode: 200,
          body: JSON.stringify({
            data: { message: 'data updated' },
          }),
        };
    
        aws.DynamoDB.DocumentClient.mockImplementationOnce(() => ({
          put: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(),
          }),
        }));
    
        const response = await lambdaHandler(event, context);
    
        expect(response).toEqual(expectedResponse);
      });
    
      it('should return a successful response for DELETE method', async () => {
        event.httpMethod = 'DELETE';
        event.pathParameters = { id: 'exampleId' };
        const expectedResponse = {
          statusCode: 200,
          body: JSON.stringify({
            data: { message: 'data deleted' },
          }),
        };
    
        aws.DynamoDB.DocumentClient.mockImplementationOnce(() => ({
          delete: jest.fn().mockReturnValueOnce({
            promise: jest.fn().mockResolvedValueOnce(),
          }),
        }));
        dynamoDB.delete().promise.mockReturnValueOnce({ message: 'data deleted' } )
    
        const response = await lambdaHandler(event, context);
    
        expect(response).toEqual(expectedResponse);
      });
    
      it('should handle an error and return an error response', async () => {
        event.httpMethod = 'GET';
        event.pathParameters = { id: 'exampleId' };
        const expectedResponse = {
          statusCode: 200,
          body: JSON.stringify('Missing ID'),
        };
    
        
        dynamoDB.get().promise.mockRejectedValueOnce(Error("Missing ID"))
        const response = await lambdaHandler(event, context);
    
        expect(response).toEqual(expectedResponse);
      });
    
    
    });
    
    `,
    default: `const { lambdaHandler } = require('../../app');

    describe('lambdaHandler', () => {
      let event;
      let context;
    
      beforeEach(() => {
        event = {}; // Set your desired event data
        context = {}; // Set your desired context data
      });
    
      it('should return a successful response', async () => {
        const expectedResponse = {
          statusCode: 200,
          body: JSON.stringify({
            message: "hello world",
          }),
        };
    
        const response = await lambdaHandler(event, context);
    
        expect(response).toEqual(expectedResponse);
      });
    
      
    });
    `,
  },
  "python3.9": {},
};
