import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { parse } from 'path';
import { parseAndValidateSafteyKeyMessage } from '../../../models/step-functions/saftey-key-sweep.model.js';
import { fetchSingleUseKeypair } from '../../../services/fetch-single-use-keypair.service.js';
import { fetchGasKeypair } from '../../../services/fetch-gas-keypair.service.js';
import { createSweepingTransaction, sendTransaction } from '../../../utilities/transaction.utility.js';

export const safteyKeySweep = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        const safteyKeyMessage = parseAndValidateSafteyKeyMessage(event);
        const gasKeypair = await fetchGasKeypair();
        const singleUseKeypair = await fetchSingleUseKeypair(safteyKeyMessage.key);
        console.log(singleUseKeypair.publicKey.toString());
        console.log(gasKeypair.publicKey.toString());
        const transaction = await createSweepingTransaction(singleUseKeypair.publicKey, gasKeypair.publicKey);
        console.log(transaction);
        transaction.partialSign(singleUseKeypair);
        transaction.partialSign(gasKeypair);
        await sendTransaction(transaction);

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
