import { web3 } from '@project-serum/anchor';
import pkg from 'aws-sdk';
const { S3 } = pkg;

export const fetchGasKeypair = async (): Promise<web3.Keypair> => {
    // const object = process.env.AWS_BUCKET_OBJECT_NAME;
    // const bucket = process.env.AWS_BUCKET_NAME;
    // const accessKey = process.env.AWS_GAS_ACCESS_KEY;
    // const secretKey = process.env.AWS_GAS_SECRET_KEY;
    // const region = process.env.AWS_BUCKET_REGION;

    // if (accessKey == null || secretKey == null || region == null || bucket == null || object == null) {
    //     throw new Error('AWS credentials not found');
    // }

    // const s3 = new S3({
    //     region: region,
    //     accessKeyId: accessKey,
    //     secretAccessKey: secretKey,
    // });

    // const output = await s3
    //     .getObject({
    //         Bucket: bucket,
    //         Key: object,
    //     })
    //     .promise();

    // if (output.Body == null) {
    //     throw new Error('AWS output not found');
    // }

    // const seedString = output.Body.toString('ascii');
    // const seedArray = JSON.parse(seedString);

    const seedArray = [
        122, 158, 144, 235, 94, 7, 50, 19, 66, 69, 87, 78, 7, 156, 22, 74, 53, 117, 112, 136, 163, 87, 140, 252, 34,
        133, 74, 172, 188, 164, 87, 29, 129, 40, 148, 116, 85, 147, 135, 143, 47, 146, 12, 136, 125, 107, 239, 235, 15,
        14, 169, 80, 0, 197, 117, 73, 150, 236, 222, 191, 66, 151, 231, 92,
    ];

    const seed = Uint8Array.from(seedArray);
    const keypair = web3.Keypair.fromSecretKey(seed);

    return keypair;
};
