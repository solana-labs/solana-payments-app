import { web3 } from '@project-serum/anchor'

const NO_RPC_URL_ERROR_MESSAGE = 'Could not make a valid RPC connection.'

export const createConnection = (): web3.Connection => {
    // const rpcUrl = process.env.RPC_URL

    // if (rpcUrl == undefined) {
    //     throw new Error(NO_RPC_URL_ERROR_MESSAGE)
    // }

    return new web3.Connection(
        'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e'
    )
}
