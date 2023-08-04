import { Connection } from '@solana/web3.js';
import { MissingEnvError } from '../errors/missing-env.error.js';

export const getConnection = () => {
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    return new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
};

export const getConnectionUrl = () => {
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (heliusApiKey == null) {
        throw new MissingEnvError('helius api');
    }

    return `https://rpc.helius.xyz/?api-key=${heliusApiKey}`;
};
