import { PaymentRecord } from '@prisma/client';
import * as web3 from '@solana/web3.js';
import pkg from 'aws-sdk';
const { S3 } = pkg;

// This service method should upload the keypair to an encrypted s3 bucket for rent collection
// at a later time.

export const uploadSingleUseKeypair = async (singleUseKeypair: web3.Keypair, paymentRecord: PaymentRecord) => {
    const bucket = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_NAME;
    const region = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_REGION;

    console.log(bucket);

    if (bucket == null || region == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new S3({
        region: region,
    });

    console.log(singleUseKeypair);

    console.log(singleUseKeypair.secretKey);

    const seedString = JSON.stringify(singleUseKeypair.secretKey);

    console.log(seedString);

    try {
        // TODO: Log the successful upload in sentry
        await s3
            .upload({
                Bucket: bucket,
                Key: `${paymentRecord.id}.json`,
                Body: seedString,
                ContentType: 'application/json',
            })
            .promise();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Couldnt upload keypair to s3. Unknown reason.');
        }
    }
};
