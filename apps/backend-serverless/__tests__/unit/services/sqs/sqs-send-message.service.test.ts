// File: sqsRetryService.test.ts
import { sendRetryMessage } from '../../../../src/services/sqs/sqs-send-message.service.js';
import { SQS } from 'aws-sdk';
import { ShopifyMutationRetryType } from '../../../../src/models/shopify-mutation-retry.model.js';

describe('unit testing the sqs send message service', () => {
    it('should call SQS.sendMessage with correct parameters', async () => {
        process.env.SHOPIFY_SQS_URL = 'mock-queue-url';

        // Mock SQS instance
        const mockSqs = {
            sendMessage: jest.fn().mockImplementation(() => ({
                promise: jest.fn(),
            })),
        } as unknown as SQS;

        const mockPaymentResolveInfo = {
            paymentId: 'example-payment-id',
        };

        // Invoke function with mock SQS
        await sendRetryMessage(
            ShopifyMutationRetryType.paymentResolve,
            mockPaymentResolveInfo,
            null,
            null,
            null,
            null,
            0,
            mockSqs
        );

        // Validate sendMessage has been called with correct parameters
        expect(mockSqs.sendMessage).toHaveBeenCalledWith({
            QueueUrl: 'mock-queue-url',
            MessageBody: JSON.stringify({
                paymentResolve: mockPaymentResolveInfo,
                paymentReject: null,
                refundResolve: null,
                refundReject: null,
                appConfigure: null,
                retryType: ShopifyMutationRetryType.paymentResolve,
                retryStepIndex: 0,
                retrySeconds: 0,
            }),
            MessageAttributes: {
                'message-type': {
                    DataType: 'String',
                    StringValue: 'shopify-mutation-retry',
                },
            },
        });
    });
});
