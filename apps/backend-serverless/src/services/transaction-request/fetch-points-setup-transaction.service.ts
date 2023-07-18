import axios from 'axios';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { buildPointsSetupTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';

export const fetchPointsSetupTransaction = async (
    pointsMintAddress: string,
    gasAddress: string,
    feePayer: string,
    axiosInstance: typeof axios
): Promise<TransactionRequestResponse> => {
    const endpoint = buildPointsSetupTransactionRequestEndpoint(pointsMintAddress, feePayer, gasAddress);
    const headers = {
        'Content-Type': 'application/json',
    };

    const response = await axiosInstance.post(endpoint, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching payment transaction.');
    }

    const paymentTransactionResponse = parseAndValidateTransactionRequestResponse(response.data);

    return paymentTransactionResponse;
};
