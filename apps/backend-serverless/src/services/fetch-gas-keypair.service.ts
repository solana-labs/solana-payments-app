import * as web3 from '@solana/web3.js';
import pkg from 'aws-sdk';
const { S3, Endpoint } = pkg;

export const fetchGasKeypair = async (): Promise<web3.Keypair> => {
    const object = process.env.AWS_BUCKET_OBJECT_NAME;
    const bucket = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_BUCKET_REGION;

    if (region == null || bucket == null || object == null) {
        throw new Error('AWS credentials not found');
    }

    // if (localGas != null) {
    //     console.log('where tfffff');
    //     const seed = Uint8Array.from(JSON.parse(localGas));
    //     const keypair = web3.Keypair.fromSecretKey(seed);
    //     return keypair;
    // }

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

    console.log(output.Body.toString('ascii'));
    const seedString = output.Body.toString('ascii');
    console.log(seedString);
    const seedArray = JSON.parse(seedString);
    console.log(seedArray);

    const seed = Uint8Array.from(seedArray);
    console.log(seed);
    const keypair = web3.Keypair.fromSecretKey(seed);
    console.log(keypair);
    console.log(keypair.secretKey);

    return keypair;
};
