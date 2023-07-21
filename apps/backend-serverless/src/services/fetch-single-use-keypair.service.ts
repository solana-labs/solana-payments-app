import * as web3 from '@solana/web3.js';
import pkg from 'aws-sdk';
const { S3, Endpoint } = pkg;

export const fetchSingleUseKeypair = async (key: string): Promise<web3.Keypair> => {
    const bucket = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_NAME;
    const region = process.env.AWS_SINGLE_USE_KEYPAIR_BUCKET_REGION;

    if (region == null || bucket == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new S3({
        region: region,
    });

    const output = await s3
        .getObject({
            Bucket: bucket,
            Key: key,
        })
        .promise();

    if (output.Body == null) {
        throw new Error('AWS output not found');
    }

    const seedString = output.Body.toString('ascii');
    const seedDictionary = JSON.parse(seedString);

    const seedArray = Object.values(seedDictionary).map(value => {
        return parseInt(value as string);
    });
    const seed = Uint8Array.from(seedArray);
    const keypair = web3.Keypair.fromSecretKey(seed);

    return keypair;
};
