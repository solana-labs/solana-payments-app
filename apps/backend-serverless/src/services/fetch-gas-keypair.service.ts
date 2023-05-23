import { web3 } from '@project-serum/anchor';
import * as AWS from 'aws-sdk';

export const fetchGasKeypair = async (): Promise<web3.Keypair> => {
    const object = process.env.AWS_BUCKET_OBJECT_NAME;
    const bucket = process.env.AWS_BUCKET_NAME;
    const accessKey = process.env.AWS_ACCESS_KEY;
    const secretKey = process.env.AWS_SECRET_KEY;
    const region = process.env.AWS_BUCKET_REGION;

    if (accessKey == null || secretKey == null || region == null || bucket == null || object == null) {
        throw new Error('AWS credentials not found');
    }

    const s3 = new AWS.S3({
        region: region,
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
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
