import { Injectable } from '@nestjs/common';
import { GetQueueAttributesCommand, SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { ServerAwsSqsConfig } from '../classes/server-aws-sqs-config.class';

@Injectable()
export class SqsService {
  constructor(private sqs: SQSClient, private config: ServerAwsSqsConfig) { }

  async publish<TData>(event: TData) {

    try {
      const command = new SendMessageCommand({
        MessageBody: JSON.stringify(event),
        QueueUrl: this.config.AWS_SQS_URL,

      });

      await this.sqs.send(command);
    } catch (err) {
      console.error(`Error sending data to SQS:`, event, err);
    }
  }

  async verifyQueue() {
    const QueueUrl = this.config.AWS_SQS_URL;
    try {
      const command = new GetQueueAttributesCommand({
        QueueUrl,
        AttributeNames: ['QueueArn']
      });
      await this.sqs.send(command);
      console.log('Queue verification successful');
      return true;
    } catch (error: any) {
      if (error.name === 'AWS.SimpleQueueService.NonExistentQueue') {
        console.error('Queue does not exist:', QueueUrl);
      } else if (error.name === 'AccessDeniedException') {
        console.error('Permission denied. Check IAM roles/policies');
      } else {
        console.error('Queue verification failed:', error.message);
      }
      throw error;
    }
  }
}