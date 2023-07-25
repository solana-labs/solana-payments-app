import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const paymentApp = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const body = JSON.parse(event.body!);
    const query = body['query'];

    const paymentsAppConfigure = query.includes('PaymentsAppConfigure');
    const paymentSessionResolve = query.includes('PaymentSessionResolve');
    const paymentSessionReject = query.includes('PaymentSessionReject');
    const refundSessionResolve = query.includes('RefundSessionResolve');
    const refundSessionReject = query.includes('RefundSessionReject');

    let data = {};

    if (paymentsAppConfigure) {
        data = {
            paymentsAppConfigure: {
                paymentsAppConfiguration: {
                    externalHandle: 'merchant-0',
                    ready: true,
                },
                userErrors: [],
            },
        };
    } else if (paymentSessionResolve) {
        data = {
            paymentSessionResolve: {
                paymentSession: {
                    id: 'mock-id',
                    state: {
                        code: 'RESOLVED',
                    },
                    nextAction: {
                        action: 'REDIRECT',
                        context: {
                            redirectUrl: 'https://www.shopify.com/',
                        },
                    },
                },
                userErrors: [],
            },
        };
    } else if (paymentSessionReject) {
        data = {
            paymentSessionReject: {
                paymentSession: {
                    id: 'some-mock-payment-session-id',
                    state: {
                        code: 'REJECTED',
                        reason: 'RISKY',
                    },
                    nextAction: {
                        action: 'REDIRECT',
                        context: { redirectUrl: 'https://example.com' },
                    },
                },
                userErrors: [],
            },
        };
    } else if (refundSessionResolve) {
        data = {
            refundSessionResolve: {
                refundSession: {
                    id: 'mock-id',
                    state: {
                        code: 'RESOLVED',
                    },
                },
            },
        };
    } else if (refundSessionReject) {
        data = {
            refundSessionReject: {
                refundSession: {
                    id: 'some-mock-refund-session-id',
                    state: {
                        code: 'REJECTED',
                        reason: 'PROCESSING_ERROR',
                        merchantMessage: 'some lil reason thing',
                    },
                },
                userErrors: [],
            },
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data,
            extensions: {
                cost: {
                    requestedQueryCost: 1,
                    actualQueryCost: 1,
                    throttleStatus: {
                        maximumAvailable: 1000,
                        currentlyAvailable: 999,
                        restoreRate: 50,
                    },
                },
            },
        }),
    };
};
