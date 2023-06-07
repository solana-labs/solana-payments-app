import { PaginatedTable } from '@/components/PaginatedTable';
import * as RE from '@/lib/Result';
import { abbreviateAddress } from '@/lib/abbreviateAddress';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { formatPrice } from '@/lib/formatPrice';
import { RefundStatus, useOpenRefundStore } from '@/stores/refundStore';
import * as Dialog from '@radix-ui/react-dialog';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import axios from 'axios';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import * as Button from './Button';
import { Close } from './icons/Close';

interface Props {
    className?: string;
}

const REFUND_COLUMNS = ['Shopify Order #', 'Requested On', 'Requested Refund', 'Purchase Amount', 'Status'];

export function OpenRefunds(props: Props) {
    const [page, setPage] = useState(0);
    const [totalNumPages, setTotalNumPages] = useState(0);

    const openRefunds = useOpenRefundStore(state => state.openRefunds);
    const getOpenRefunds = useOpenRefundStore(state => state.getOpenRefunds);

    const { publicKey, sendTransaction, signTransaction, connect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();
    const [approvePending, setApprovePending] = useState(false);
    const [denyPending, setDenyPending] = useState(false);
    const [openApprove, setOpenApprove] = useState<string | null>(null);
    const [denyApprove, setDenyApprove] = useState<string | null>(null);

    const approvePendingRef = useRef(approvePending);
    const denyPendingRef = useRef(denyPending);

    const headers = {
        'Content-Type': 'application/json',
    };

    useEffect(() => {
        if (RE.isOk(openRefunds) && openRefunds.data.totalPages !== totalNumPages) {
            setTotalNumPages(openRefunds.data.totalPages);
        }
    }, [openRefunds]);

    async function getRefundTransaction(refundId: string) {
        setApprovePending(true);
        approvePendingRef.current = true;

        try {
            if (!connected) {
                await select(wallets[0].adapter.name);
                await connect();
            }
        } catch (error) {
            console.log('connect error', error);
        }

        try {
            const response = await axios.post(
                API_ENDPOINTS.refundTransaction + '?refundId=' + refundId,
                {
                    account: publicKey ? publicKey.toBase58() : '',
                },
                { headers: headers }
            );
            const buffer = Buffer.from(response.data.transaction, 'base64');
            const transaction = Transaction.from(buffer);
            await sendTransaction(transaction, connection);
            while (approvePendingRef.current) {
                const status = await axios.get(API_ENDPOINTS.refundStatus + '?shopId=' + refundId, {
                    headers: headers,
                });
                await new Promise(resolve => setTimeout(resolve, 500));
                if (status.data.refundStatus.status !== RefundStatus.Pending) {
                    break;
                }
            }
        } catch (error) {
            console.log('error: ', error);
        }

        if (approvePendingRef.current) {
            await getOpenRefunds(page);
            setOpenApprove(null);
            setApprovePending(false);
        }
    }

    async function rejectRefund(refundId: string) {
        setDenyPending(true);
        denyPendingRef.current = true;
        try {
            const response = await axios.post(
                API_ENDPOINTS.rejectRefund + '?refundId=' + refundId + '&merchantReason=' + 'test_reason',
                { headers: headers }
            );

            while (denyPendingRef.current) {
                const status = await axios.get(API_ENDPOINTS.refundStatus + '?shopId=' + refundId, {
                    headers: headers,
                });
                if (status.data.refundStatus.status !== RefundStatus.Pending) {
                    break;
                }
            }
        } catch (error) {
            console.log('reject error: ', error);
        }

        if (denyPendingRef.current) {
            await getOpenRefunds(page);
            setDenyPending(false);
        }
    }

    return (
        <PaginatedTable
            className={twMerge(props.className, 'mt-8')}
            columns={['orderId', 'requestedAt', 'requestedRefundAmount', 'purchaseAmount', 'status']}
            curPage={RE.map(openRefunds, ({ refunds }) => refunds)}
            headers={{
                orderId: 'Shopify Order ID',
                requestedAt: 'Requested On',
                requestedRefundAmount: 'Requested Refund',
                purchaseAmount: 'Purchase Amount',
                status: 'Status',
            }}
            numPages={totalNumPages}
            rowHeight={'h-20'}
            rowsPerPage={5}
            onPageChange={setPage}
        >
            {{
                orderId: orderId => (
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
                        key={orderId}
                    >
                        {orderId.length > 6 ? orderId.substring(0, 6) + '...' : orderId}
                    </div>
                ),
                requestedAt: requestedAt => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'text-black')}
                    >
                        {format(requestedAt, 'MMM d, h:mmaa')}
                    </div>
                ),
                requestedRefundAmount: requestedRefundAmount => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'text-black')}
                    >
                        {formatPrice(Math.abs(requestedRefundAmount))}
                    </div>
                ),
                purchaseAmount: purchaseAmount => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'text-black')}
                    >
                        {formatPrice(Math.abs(purchaseAmount))}
                    </div>
                ),
                status: (_, refund) => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'space-x-3')}
                    >
                        <Dialog.Root open={denyApprove === refund.orderId} onOpenChange={() => setDenyApprove(null)}>
                            <Button.Secondary onClick={() => setDenyApprove(refund.orderId)}>Deny</Button.Secondary>
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
                                    <Dialog.Content
                                        className="bg-white rounded-xl overflow-hidden"
                                        onPointerDownOutside={() => {
                                            denyPendingRef.current = false;
                                            setDenyApprove(null);
                                            setDenyPending(false);
                                        }}
                                    >
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
                        <Dialog.Root open={openApprove === refund.orderId} onOpenChange={() => setOpenApprove(null)}>
                            <Button.Primary onClick={() => setOpenApprove(refund.orderId)}>Approve</Button.Primary>
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
                                    <Dialog.Content
                                        className="bg-white rounded-xl overflow-hidden"
                                        onPointerDownOutside={() => {
                                            approvePendingRef.current = false;
                                            setOpenApprove(null);
                                            setApprovePending(false);
                                        }}
                                    >
                                        <div className="px-6 pt-6 pb-9">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-2xl">
                                                        Approve Refund
                                                    </div>
                                                    <div className="mt-2 text-slate-800">
                                                        Connect your wallet and then approve the transaction.
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
                                                        {formatPrice(Math.abs(refund.requestedRefundAmount))}
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
                ),
            }}
        </PaginatedTable>
    );
}
