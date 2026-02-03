// Mock minimal app which consumes messages from SQS

const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

// Poll the SQS queue for messages every 5 seconds
setInterval(async () => {
  const data = await sqs
    .receiveMessage({
      QueueUrl: process.env.QUEUE_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 5,
    })
    .promise();

  if (data.Messages) {
    console.log('Received message:', data.Messages[0].Body);
  }
}, 5000);
