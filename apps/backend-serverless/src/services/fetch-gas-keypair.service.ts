import * as web3 from '@solana/web3.js';
import pkg from 'aws-sdk';
const { S3 } = pkg;

export const fetchGasKeypair = async (): Promise<web3.Keypair> => {
    const object = process.env.AWS_BUCKET_OBJECT_NAME;
    const bucket = process.env.AWS_BUCKET_NAME;
    const accessKey = process.env.AWS_GAS_ACCESS_KEY;
    const secretKey = process.env.AWS_GAS_SECRET_KEY;
    const region = process.env.AWS_BUCKET_REGION;

    if (accessKey == null || secretKey == null || region == null || bucket == null || object == null) {
        throw new Error('AWS credentials not found');
    }

    const localGas = process.env.LOCAL_GAS;
    console.log('local gas boii');
    console.log('local gas boii');
    console.log('local gas boii');
    console.log('local gas boii');

    if (localGas != null) {
        console.log('where tfffff');
        const seed = Uint8Array.from(JSON.parse(localGas));
        const keypair = web3.Keypair.fromSecretKey(seed);
        return keypair;
    }

    const s3 = new S3({
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
