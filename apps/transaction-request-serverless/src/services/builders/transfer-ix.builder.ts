import * as web3 from '@solana/web3.js';
import { findAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '../../utils/ata.util.js';
import { createTransferCheckedInstruction } from '@solana/spl-token';
import { TokenInformation } from '../../configs/token-list.config.js';

export const createTransferIx = async (
    sender: web3.PublicKey,
    receiverWalletAddress: web3.PublicKey | null,
    receiverTokenAddress: web3.PublicKey | null,
    token: TokenInformation,
    quantity: number,
    createAta: boolean,
    connection: web3.Connection
): Promise<web3.TransactionInstruction[]> => {
    const transferIxs: web3.TransactionInstruction[] = [];

    const senderTokenAddress: web3.PublicKey = await findAssociatedTokenAddress(sender, token.pubkey);

    let finalReceiverTokenAddress: web3.PublicKey = await getFinalReceiverTokenAddress(
        receiverWalletAddress,
        receiverTokenAddress,
        token
    );

    const info = await connection.getAccountInfo(finalReceiverTokenAddress);

    if (createAta && info == null) {
        if (receiverWalletAddress == null) {
            throw new Error('Receiver wallet address cannot be null if you need to create the ata.');
        }

        const createAssociatedInstruction = createAssociatedTokenAccountInstruction(
            finalReceiverTokenAddress,
            sender,
            receiverWalletAddress,
            token.pubkey
        );

        transferIxs.push(createAssociatedInstruction);
    }

    const transfer = createTransferCheckedInstruction(
        senderTokenAddress,
        token.pubkey,
        finalReceiverTokenAddress,
        sender,
        quantity,
        token.decimals
    );

    transferIxs.push(transfer);

    return transferIxs;
};

const getFinalReceiverTokenAddress = async (
    receiverWalletAddress: web3.PublicKey | null,
    receiverTokenAddress: web3.PublicKey | null,
    token: TokenInformation
): Promise<web3.PublicKey> => {
    let finalReceiverTokenAddress: web3.PublicKey | null = null;

    if (receiverWalletAddress == null && receiverTokenAddress == null) {
        throw new Error('Receiver wallet address and receiver token address cannot both be null.');
    } else if (receiverTokenAddress == null && receiverWalletAddress != null) {
        finalReceiverTokenAddress = await findAssociatedTokenAddress(receiverWalletAddress, token.pubkey);
    } else if (receiverTokenAddress != null && receiverWalletAddress == null) {
        finalReceiverTokenAddress = receiverTokenAddress;
    } else if (receiverTokenAddress != null && receiverWalletAddress != null) {
        const tempAssociatedTokenAddress = await findAssociatedTokenAddress(receiverWalletAddress, token.pubkey);
        if (receiverTokenAddress.toBase58() != tempAssociatedTokenAddress.toBase58()) {
            throw new Error('Receiver wallet address and receiver token address do not match.');
        }
    }

    if (finalReceiverTokenAddress == null) {
        throw new Error('Could not get final receiver token address.');
    }

    return finalReceiverTokenAddress;
};
