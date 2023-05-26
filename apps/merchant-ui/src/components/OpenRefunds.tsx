import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

import * as RE from '@/lib/Result';
import { formatPrice } from '@/lib/formatPrice';
import * as Button from './Button';
import { Close } from './icons/Close';
import { abbreviateAddress } from '@/lib/abbreviateAddress';
import { useOpenRefunds } from '@/hooks/useRefunds';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

interface Props {
    className?: string;
}

export function OpenRefunds(props: Props) {
    const [openRefunds] = useOpenRefunds();
    const { publicKey, sendTransaction, signTransaction, connect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();
    const [approvePending, setApprovePending] = useState(false);
    const [denyPending, setDenyPending] = useState(false);

    const refundColumns = ['Shopify Order #', 'Requested On', 'Requested Refund', 'Purchase Amount', 'Status'];

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    async function getRefundTransaction(refundId: string) {
        setApprovePending(true);

        try {
            if (!connected) {
                await select(wallets[0].adapter.name);
                await connect();
            }
        } catch (error) {
            console.log('connect error[', error);
        }

        try {
            // console.log('publicKey: ', publicKey.toString());
            const response = await axios.post(
                API_ENDPOINTS.refundTransaction + '?refundId=' + refundId,
                {
                    account: publicKey ? publicKey.toBase58() : '',
                },
                { headers: headers }
            );
            const buffer = Buffer.from(response.data.transaction, 'base64');
            const transaction = Transaction.from(buffer);
            console.log('returned transaction: ', transaction);
            await sendTransaction(transaction, connection);
        } catch (error) {
            console.log('error: ', error);
            // setResults(RE.failed(error));
        }
        setApprovePending(false);
    }

    async function rejectRefund(refundId: string) {
        setDenyPending(true);
        try {
            const response = await axios.post(
                API_ENDPOINTS.rejectRefund + '?refundId=' + refundId + '&merchantReason=' + 'test_reason',
                { headers: headers }
            );
            console.log('reject refund response: ', response);
        } catch (error) {
            console.log('reject error: ', error);
        }
        setDenyPending(false);
    }

    return (
        <div className={twMerge('grid', 'grid-cols-[1fr,repeat(4,max-content)]', props.className)}>
            {RE.match(
                openRefunds,
                () => (
                    <div />
                ),
                () => (
                    <div />
                ),
                refunds => (
                    <>
                        {refundColumns.map((label, i) => (
                            <div
                                className={twMerge(
                                    'border-b',
                                    'border-gray-200',
                                    'font-semibold',
                                    'py-3',
                                    'text-slate-600',
                                    'text-sm',
                                    i < 4 && 'pr-14'
                                )}
                                key={label}
                            >
                                {label}
                            </div>
                        ))}
                        {refunds.map((refund, i) => (
                            <>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'font-semibold',
                                        'h-20',
                                        'items-center',
                                        'text-black',
                                        'text-overflow'
                                    )}
                                    key={refund.orderId}
                                >
                                    {refund.orderId.length > 6
                                        ? refund.orderId.substring(0, 6) + '...'
                                        : refund.orderId}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {format(refund.requestedAt, 'MMM d, h:mmaa')}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {refund.requestedRefundAmount >= 0 ? '+' : '-'}$
                                    {formatPrice(Math.abs(refund.requestedRefundAmount))}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {refund.purchaseAmount >= 0 ? '+' : '-'}$
                                    {formatPrice(Math.abs(refund.purchaseAmount))}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'space-x-3'
                                    )}
                                >
                                    <Dialog.Root>
                                        <Dialog.Trigger asChild>
                                            <Button.Secondary>Deny</Button.Secondary>
                                        </Dialog.Trigger>
                                        <Dialog.Portal>
                                            <Dialog.Overlay
                                                className={twMerge(
                                                    'bg-black/30',
                                                    'bottom-0',
                                                    'fixed',
                                                    'grid',
                                                    'left-0',
                                                    'place-items-center',
                                                    'right-0',
                                                    'top-0',
                                                    'z-10'
                                                )}
                                            >
                                                <Dialog.Content className="bg-white rounded-xl overflow-hidden">
                                                    <div className="px-6 pt-6 pb-9">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="font-semibold text-slate-900 text-2xl">
                                                                    Deny Refund
                                                                </div>
                                                                <div className="mt-2 text-slate-800">
                                                                    Are you sure? You can’t undo this action afterwards.
                                                                </div>
                                                            </div>
                                                            <Dialog.Close
                                                                className={twMerge(
                                                                    'bg-slate-100',
                                                                    'grid',
                                                                    'h-12',
                                                                    'ml-8',
                                                                    'place-items-center',
                                                                    'rounded-full',
                                                                    'w-12'
                                                                )}
                                                            >
                                                                <Close className="h-6 w-6 fill-black" />
                                                            </Dialog.Close>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 flex justify-end">
                                                        <Button.Primary
                                                            onClick={() => rejectRefund(refund.orderId)}
                                                            pending={denyPending}
                                                        >
                                                            Deny Refund
                                                        </Button.Primary>
                                                    </div>
                                                </Dialog.Content>
                                            </Dialog.Overlay>
                                        </Dialog.Portal>
                                    </Dialog.Root>
                                    <Dialog.Root>
                                        <Dialog.Trigger asChild>
                                            <Button.Primary>Approve</Button.Primary>
                                        </Dialog.Trigger>
                                        <Dialog.Portal>
                                            <Dialog.Overlay
                                                className={twMerge(
                                                    'bg-black/30',
                                                    'bottom-0',
                                                    'fixed',
                                                    'grid',
                                                    'left-0',
                                                    'place-items-center',
                                                    'right-0',
                                                    'top-0',
                                                    'z-10'
                                                )}
                                            >
                                                <Dialog.Content className="bg-white rounded-xl overflow-hidden">
                                                    <div className="px-6 pt-6 pb-9">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="font-semibold text-slate-900 text-2xl">
                                                                    Approve Refund
                                                                </div>
                                                                <div className="mt-2 text-slate-800">
                                                                    Connect your wallet and then approve the
                                                                    transaction.
                                                                </div>
                                                            </div>
                                                            <Dialog.Close
                                                                className={twMerge(
                                                                    'bg-slate-100',
                                                                    'grid',
                                                                    'h-12',
                                                                    'ml-8',
                                                                    'place-items-center',
                                                                    'rounded-full',
                                                                    'w-12'
                                                                )}
                                                            >
                                                                <Close className="h-6 w-6 fill-black" />
                                                            </Dialog.Close>
                                                        </div>
                                                        <div className="mt-9">
                                                            <div className="font-semibold text-sm text-slate-800">
                                                                Transaction Details:
                                                            </div>
                                                            <div className="grid grid-cols-[1fr,max-content] mt-4 gap-2.5 text-slate-800">
                                                                <div>Refund amount:</div>
                                                                <div className="font-semibold text-right">
                                                                    {refund.requestedRefundAmount >= 0 ? '+' : '-'}$
                                                                    {formatPrice(
                                                                        Math.abs(refund.requestedRefundAmount)
                                                                    )}
                                                                </div>
                                                                <div>Refund to:</div>
                                                                <div className="font-semibold text-right">
                                                                    {abbreviateAddress(refund.refundTo)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 flex justify-end">
                                                        <Button.Primary
                                                            onClick={() => getRefundTransaction(refund.orderId)}
                                                            pending={approvePending}
                                                        >
                                                            Approve with Wallet
                                                        </Button.Primary>
                                                    </div>
                                                </Dialog.Content>
                                            </Dialog.Overlay>
                                        </Dialog.Portal>
                                    </Dialog.Root>
                                </div>
                            </>
                        ))}
                    </>
                )
            )}
        </div>
    );
}
