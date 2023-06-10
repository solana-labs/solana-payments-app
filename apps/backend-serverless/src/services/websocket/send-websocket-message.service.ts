import pkg from 'aws-sdk';
const { ApiGatewayManagementApi } = pkg;

export const sendWebsocketMessage = async (connectionId: string, payload: unknown): Promise<void> => {
    const apigwManagementApi = new ApiGatewayManagementApi({
        endpoint: 'http://localhost:4009',
    });

    const postParams = {
        Data: JSON.stringify(payload),
        ConnectionId: connectionId,
    };

    // {
    //     messageType: 'paymentDetails',
    //     paymentDetails: {
    //         merchantDisplayName: 'Test Merchant',
    //         totalAmountUSDCDisplay: '10 USDC',
    //         totalAmountFiatDisplay: '$10.00',
    //         cancelUrl: 'https://example.com/cancel',
    //         completed: false,
    //         redirectUrl: null,
    //     },
    // }

    try {
        const connection = await apigwManagementApi.postToConnection(postParams).promise();
        console.log(connection);
    } catch (err) {
        if (err.statusCode === 410) {
            console.log(err);
            console.log('Found stale connection, deleting ' + connectionId);
        } else {
            console.error('Failed to post. Error: ' + JSON.stringify(err));
        }
    }
};
