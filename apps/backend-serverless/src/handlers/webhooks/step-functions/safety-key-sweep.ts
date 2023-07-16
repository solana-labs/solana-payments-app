import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    SafetyKeyMessage,
    parseAndValidateSafetyKeyMessage,
} from '../../../models/step-functions/safety-key-sweep.model.js';
import { fetchGasKeypair } from '../../../services/fetch-gas-keypair.service.js';
import { fetchSingleUseKeypair } from '../../../services/fetch-single-use-keypair.service.js';
import { deleteSingleUseKeypair } from '../../../services/s3/delete-single-use-keypair.service.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { createSweepingTransaction, sendTransaction } from '../../../utilities/transaction.utility.js';

export const safetyKeySweep = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in safety key sweep',
            level: 'info',
        });
        let safetyKeyMessage: SafetyKeyMessage;
        let gasKeypair: web3.Keypair;
        let singleUseKeypair: web3.Keypair;
        let transaction: web3.Transaction;

        try {
            safetyKeyMessage = parseAndValidateSafetyKeyMessage(event);
            gasKeypair = await fetchGasKeypair();
            singleUseKeypair = await fetchSingleUseKeypair(safetyKeyMessage.key);
            transaction = await createSweepingTransaction(singleUseKeypair.publicKey, gasKeypair.publicKey);
            transaction.partialSign(singleUseKeypair);
            transaction.partialSign(gasKeypair);
            await sendTransaction(transaction);
            try {
                await deleteSingleUseKeypair(safetyKeyMessage.key);
            } catch (error) {
                Sentry.captureException(error);
            }
        } catch (error) {
            return createErrorResponse(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    },
);
