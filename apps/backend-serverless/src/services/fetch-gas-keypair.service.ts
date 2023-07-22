import * as web3 from '@solana/web3.js';
import pkg from 'aws-sdk';
import bs58 from 'bs58';
const { S3, Endpoint } = pkg;

export const fetchGasKeypair = async (): Promise<web3.Keypair> => {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return web3.Keypair.fromSecretKey(bs58.decode(process.env.GAS_KEYPAIR_SECRET_KEY!));
    }

    const object = process.env.AWS_BUCKET_OBJECT_NAME;
    const bucket = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_BUCKET_REGION;

    if (region == null || bucket == null || object == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new S3({
        region: region,
    });

    const output = await s3
        .getObject({
            Bucket: bucket,
            Key: object,
        })
        .promise();

    if (output.Body == null) {
        throw new Error('AWS output not found');
    }

    const seedString = output.Body.toString('ascii');
    const seedArray = JSON.parse(seedString);

    const seed = Uint8Array.from(seedArray);
    const keypair = web3.Keypair.fromSecretKey(seed);

    return keypair;
};
