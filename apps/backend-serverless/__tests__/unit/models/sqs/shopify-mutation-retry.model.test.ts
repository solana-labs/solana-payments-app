import {
    PaymentSessionStateRejectedReason,
    RefundSessionStateRejectedReason,
} from '../../../../src/models/shopify-graphql-responses/shared.model.js';
import {
    ShopifyMutationRetryType,
    parseAndValidateShopifyMutationRetry,
} from '../../../../src/models/sqs/shopify-mutation-retry.model.js';
import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

describe('unit testing mutation retry model', () => {
    const validParams = {
        retryType: ShopifyMutationRetryType.paymentResolve,
        retryStepIndex: 1,
        retrySeconds: 1,
        paymentResolve: {
            paymentId: 'some-id',
        },
        paymentReject: {
            paymentId: 'some-id',
            reason: PaymentSessionStateRejectedReason.processingError,
        },
        refundResolve: {
            refundId: 'some-id',
        },
        refundReject: {
            refundId: 'some-id',
            code: RefundSessionStateRejectedReason.processingError,
            merchantMessage: 'some-message',
        },
        appConfigure: { merchantId: 'some-id', state: true },
    };

    const fields = [
        'retryType',
        'retryStepIndex',
        'retrySeconds',
        'paymentResolve',
        'paymentReject',
        'refundResolve',
        'refundReject',
        'appConfigure',
    ];

    const wrongTypes = {
        retryType: 123,
        retryStepIndex: '1',
        retrySeconds: '1',
        paymentResolve: {
            paymentId: 123,
        },
        paymentReject: {
            paymentId: 123,
            reason: 123,
        },
        refundResolve: {
            refundId: 123,
        },
        refundReject: {
            refundId: 123,
            code: 123,
            merchantMessage: 123,
        },
        appConfigure: { merchantId: 123, state: 'true' },
    };

    runValidParameterTest(parseAndValidateShopifyMutationRetry, validParams);
    runMissingFieldTests(parseAndValidateShopifyMutationRetry, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateShopifyMutationRetry, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateShopifyMutationRetry, validParams, fields);
});
