import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import pkg from 'aws-sdk';
import { ShopifyRecord } from './database/record-service.database.service.js';
const { S3 } = pkg;

// This service method should upload the keypair to an encrypted s3 bucket for rent collection
// at a later time.

export const uploadSingleUseKeypair = async (singleUseKeypair: web3.Keypair, record: ShopifyRecord) => {
    const bucket = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_NAME;
    const region = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_REGION;

    if (bucket == null || region == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new S3({
        region: region,
    });

    const seedString = JSON.stringify(singleUseKeypair.secretKey);

    try {
        await s3
            .upload({
                Bucket: bucket,
                Key: `${record.id}.json`,
                Body: seedString,
                ContentType: 'application/json',
            })
            .promise();

        Sentry.captureEvent({
            message: 'Single Use Keypair uploaded to s3',
            level: 'info',
        });
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Couldnt upload keypair to s3. Unknown reason.');
        }
    }
};
