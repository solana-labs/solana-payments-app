import { PaymentRecord } from '@prisma/client';
import { web3 } from '@project-serum/anchor';
import * as AWS from 'aws-sdk';

// This service method should upload the keypair to an encrypted s3 bucket for rent collection
// at a later time.

export const uploadSingleUseKeypair = async (singleUseKeypair: web3.Keypair, paymentRecord: PaymentRecord) => {
    const bucket = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_NAME;
    const accessKey = process.env.AWS_SINGLE_USE_KEYPAIR_ACCESS_KEY;
    const secretKey = process.env.AWS_SINGLE_USE_KEYPAIR_SECRET_KEY;
    const region = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_REGION;

    if (bucket == null || accessKey == null || secretKey == null || region == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new AWS.S3({
        region: region,
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
    });

    const seedString = JSON.stringify(singleUseKeypair.secretKey);

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
