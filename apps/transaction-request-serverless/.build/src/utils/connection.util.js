import { web3 } from '@project-serum/anchor';
var NO_RPC_URL_ERROR_MESSAGE = 'Could not make a valid RPC connection.';
export var createConnection = function () {
    var rpcUrl = process.env.RPC_URL;
    if (rpcUrl == undefined) {
        throw new Error(NO_RPC_URL_ERROR_MESSAGE);
    }
    return new web3.Connection(rpcUrl);
};
//# sourceMappingURL=connection.util.js.map