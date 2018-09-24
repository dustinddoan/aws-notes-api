import uuid from 'uuid';
import AWS from 'aws-sdk';

AWS.config.update({region: "us-east-2"});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export function main(event, context, callback) {
  // red body is passed in as JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  // 'Item' contains the attributes of the item to be created
  // - 'userId': user identities are federated through the
  // Cognito Identity Pool, we will use the identity id
  // as the user id of the authenticated user
  // - 'noteId': a unique uuid
  // - 'content': parsed from request body
  // - 'attachment': parsed from request body
  // - 'createdAt': current Unix timestamp

  const params = {
    TableName: "notes",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      nodeId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  dynamoDb.put(params, (error, data) => {
    // Set response headers to enable CORS (Cross-Origin Resource Sharing)
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    };

    // return status code 500 on error
    if (error) {
      const response = {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({
          status: false
        })
      }

      callback(null, response);
      return
    }

    // return status code 200 and the ewnly created item
    const response = {
      statusCode: 200, 
      headers: headers,
      body: JSON.stringify(params.Item)
    }

    callback(null, response)
  });
}