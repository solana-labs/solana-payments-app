import * as web3 from '@solana/web3.js';

const NO_RPC_URL_ERROR_MESSAGE = 'Could not make a valid RPC connection.';

export const createConnection = (): web3.Connection => {
    const rpcUrl = process.env.RPC_URL;

    if (rpcUrl == undefined) {
        throw new Error(NO_RPC_URL_ERROR_MESSAGE);
    }

    return new web3.Connection(rpcUrl);
};
