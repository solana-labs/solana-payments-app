import { web3 } from '@project-serum/anchor'
import {
    findAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
} from '../../utils/ata.util.js'
import { createTransferCheckedInstruction } from '@solana/spl-token'
import { TokenInformation } from '../../configs/token-list.config.js'

export const createTransferIx = async (
    sender: web3.PublicKey,
    receiver: web3.PublicKey,
    token: TokenInformation,
    quantity: number,
    createAta: boolean,
    connection: web3.Connection
): Promise<web3.TransactionInstruction[]> => {
    const transferIxs: web3.TransactionInstruction[] = []

    var senderAssociatedTokenAddress = await findAssociatedTokenAddress(
        sender,
        token.pubkey
    )

    var receiverAssociatedTokenAddress = await findAssociatedTokenAddress(
        receiver,
        token.pubkey
    )

    console.log(senderAssociatedTokenAddress.toBase58())
    console.log(receiverAssociatedTokenAddress.toBase58())

    const info = await connection.getAccountInfo(receiverAssociatedTokenAddress)

    if (createAta && info == null) {
        const createAssociatedInstruction =
            createAssociatedTokenAccountInstruction(
                receiverAssociatedTokenAddress,
                sender,
                receiver,
                token.pubkey
            )

        transferIxs.push(createAssociatedInstruction)
    }

    const transfer = createTransferCheckedInstruction(
        senderAssociatedTokenAddress,
        token.pubkey,
        receiverAssociatedTokenAddress,
        sender,
        quantity,
        token.decimals
    )

    transferIxs.push(transfer)

    return transferIxs
}
