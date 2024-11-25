import { Module } from '@nestjs/common';
import { moduleFactory } from '@onivoro/server-common';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SqsService } from './services/sqs.service';
import { ServerAwsSqsConfig } from './classes/server-aws-sqs-config.class';

let sqsClient: SQSClient | null = null;

@Module({})
export class LibApiIvinesisSqsModule {
  static configure(config: ServerAwsSqsConfig) {
    return moduleFactory({
      module: LibApiIvinesisSqsModule,
      providers: [
        {
          provide: SQSClient,
          useFactory: () => sqsClient
            ? sqsClient
            : sqsClient = new SQSClient({
              region: config.AWS_REGION,
              logger: console,
              credentials: config.NODE_ENV === 'production'
                ? undefined
                : {
                  accessKeyId: config.AWS_ACCESS_KEY_ID,
                  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
                }
            })
        },
        { provide: ServerAwsSqsConfig, useValue: config },
        SqsService
      ],
    })
  }
}
