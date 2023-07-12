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
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw new Error('Could not parse and validate the safety key message');
        }

        try {
            gasKeypair = await fetchGasKeypair();
            singleUseKeypair = await fetchSingleUseKeypair(safetyKeyMessage.key);
        } catch (error) {
            Sentry.captureException(error);
            console.log(error);
            throw error;
        }

        try {
            transaction = await createSweepingTransaction(singleUseKeypair.publicKey, gasKeypair.publicKey);
            transaction.partialSign(singleUseKeypair);
            transaction.partialSign(gasKeypair);
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw error;
        }

        try {
            await sendTransaction(transaction);
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            throw error;
        }

        try {
            await deleteSingleUseKeypair(safetyKeyMessage.key);
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
