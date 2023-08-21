import * as Button from '@/components/Button';
import { PaginatedTable } from '@/components/PaginatedTable';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { formatPrice } from '@/lib/formatPrice';
import { useMerchantStore } from '@/stores/merchantStore';
import { RefundStatus, useOpenRefundStore } from '@/stores/refundStore';
import * as Dialog from '@radix-ui/react-dialog';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction } from '@solana/web3.js';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { MdSyncProblem } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
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
    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    const { publicKey, sendTransaction, wallet, connect, disconnect, connected, wallets, select } = useWallet();
    const { connection } = useConnection();
    const [approvePending, setApprovePending] = useState(false);
    const [denyPending, setDenyPending] = useState(false);
    const [openApprove, setOpenApprove] = useState<string | null>(null);
    const [denyApprove, setDenyApprove] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState<string>('');

    const [walletModalActive, setWalletModalActive] = useState(false);

    const approvePendingRef = useRef(approvePending);
    const denyPendingRef = useRef(denyPending);

    const { toast } = useToast();

    const headers = {
        'Content-Type': 'application/json',
    };

    const pageRef = useRef(page);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        if (RE.isOk(openRefunds) && openRefunds.data.totalPages !== totalNumPages) {
            setTotalNumPages(openRefunds.data.totalPages);
        }
    }, [openRefunds]);

    useEffect(() => {
        getOpenRefunds(page);

        const intervalId = setInterval(() => {
            getOpenRefunds(pageRef.current);
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        setWalletModalActive(false);
    }, [wallet]);

    async function approveRefund(refundIdToProcess: string) {
        let isErrorOccurred = false;
        setApprovePending(true);
        approvePendingRef.current = true;
        if (!publicKey) {
            return;
        }
        try {
            const response = await fetch(`${API_ENDPOINTS.refundTransaction}?refundId=${refundIdToProcess}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    account: publicKey.toBase58(),
                }),
                credentials: 'include',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const buffer = Buffer.from(data.transaction, 'base64');
            const transaction = Transaction.from(buffer);
            await sendTransaction(transaction, connection);
            while (approvePendingRef.current && !isErrorOccurred) {
                try {
                    const statusResponse = await fetch(`${API_ENDPOINTS.refundStatus}?shopId=${refundIdToProcess}`, {
                        headers: headers,
                        credentials: 'include',
                    });
                    const statusData = await statusResponse.json();
                    if (!statusResponse.ok) {
                        throw new Error(`HTTP error! status: ${statusResponse.status}`);
                    }
                    await new Promise(resolve => setTimeout(resolve, 500));
                    if (statusData.refundStatus.status !== RefundStatus.Pending) {
                        break;
                    }
                } catch (error) {
                    isErrorOccurred = true; // Update the flag when an error occurs
                    if (error instanceof Error) {
                        toast({
                            title: 'Error Fetching Refund Status',
                            description: error.message,
                            variant: 'destructive',
                        });
                    }
                    throw error; // Re-throw the error
                }
            }
            toast({
                title: 'Successfully Approved Refund!',
                variant: 'constructive',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Approving Refund',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
            }
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
            const rejectParams = {
                refundId: refundId,
                merchantReason: rejectReason,
            };
            const response = await fetch(`${API_ENDPOINTS.rejectRefund}?${new URLSearchParams(rejectParams)}`, {
                method: 'POST',
                headers: headers,
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            while (denyPendingRef.current) {
                const statusResponse = await fetch(`${API_ENDPOINTS.refundStatus}?shopId=${refundId}`, {
                    headers: headers,
                    credentials: 'include',
                });
                const statusData = await statusResponse.json();
                if (!statusResponse.ok) {
                    throw new Error(`HTTP error! status: ${statusResponse.status}`);
                }
                if (statusData.refundStatus.status !== RefundStatus.Pending) {
                    break;
                }
            }
            toast({
                title: 'Successfully Rejected Refund!',
                variant: 'constructive',
            });
            setRejectReason('');
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    title: 'Error Rejecting Refund',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
            }
        }

        if (denyPendingRef.current) {
            await getOpenRefunds(page);
            setDenyApprove(null);
            setDenyPending(false);
        }
    }

    if (RE.isFailed(merchantInfo)) {
        return (
            <div className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">This Merchant does not exist</h1>
                        <p className="text-lg  mt-2">Please Log in with a different Merchant account</p>
                    </div>
                </div>
            </div>
        );
    }

    if (RE.isFailed(openRefunds)) {
        return (
            <div className={props.className}>
                <div className="flex flex-col justify-center h-full text-red-700 items-center space-y-4">
                    <MdSyncProblem size={36} />
                    <p>We&apos;re having trouble loading your Open refunds data</p>
                </div>
            </div>
        );
    }

    if (RE.isOk(openRefunds) && openRefunds.data.refunds.length === 0) {
        return (
            <div className={props.className}>
                <div>
                    <div className="text-lg font-semibold md:px-7">Open Refunds</div>
                    <div className="mt-8 text-center">
                        <div className="text-sm font-medium text-neutral-600">No Pending Refunds!</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PaginatedTable
            className={twMerge(props.className, 'mt-8', 'hover:')}
            columns={['orderId', 'requestedAt', 'requestedRefundAmount', 'purchaseAmount', 'status']}
            curPage={RE.map(openRefunds, ({ refunds }) => refunds)}
            headers={{
                orderId: 'Shopify Order #',
                requestedAt: 'Requested On',
                requestedRefundAmount: 'Requested Refund',
                purchaseAmount: 'Purchase Amount',
                status: 'Status',
            }}
            numPages={totalNumPages}
            rowHeight={'h-20'}
            rowsPerPage={5}
            onPageChange={e => {
                setPage(e);
                getOpenRefunds(e);
            }}
        >
            {{
                orderId: id => <div className="font-semibold text-sm text-black">{id}</div>,
                requestedAt: requestedAt => (
                    <div className="text-sm text-slate-600 pr-11">{format(requestedAt, 'MMM d, h:mmaa')}</div>
                ),
                requestedRefundAmount: requestedRefundAmount => (
                    <div className={twMerge('text-sm', 'font-medium', 'pr-14', 'text-black')}>
                        ${formatPrice(Math.abs(requestedRefundAmount))}
                    </div>
                ),
                purchaseAmount: purchaseAmount => (
                    <div className={twMerge('text-sm', 'font-medium', 'pr-14', 'text-black')}>
                        ${formatPrice(Math.abs(purchaseAmount))}
                    </div>
                ),
                status: (_, refund) => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'space-x-3')}
                    >
                        <Dialog.Root
                            open={openApprove === refund.orderId && !walletModalActive}
                            onOpenChange={() => setOpenApprove(null)}
                        >
                            <Button.Primary
                                onClick={() => {
                                    setOpenApprove(refund.orderId);
                                    setWalletModalActive(false);
                                }}
                            >
                                Approve
                            </Button.Primary>
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
                                                    {/* <div>Refund to:</div>
                                                    <div className="font-semibold text-right">
                                                        {abbreviateAddress(refund.refundTo)}
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-4 flex justify-end border-t">
                                            {!connected ? (
                                                <div
                                                    onClick={() => {
                                                        setWalletModalActive(true);
                                                    }}
                                                >
                                                    <WalletMultiButton
                                                        style={{
                                                            backgroundColor: 'black',
                                                            width: '100%',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            zIndex: 1000,
                                                        }}
                                                    >
                                                        <div className="flex flex-row items-center justify-center">
                                                            <div className="pl-1">Connect wallet</div>
                                                        </div>
                                                    </WalletMultiButton>
                                                </div>
                                            ) : (
                                                <div className="flex flex-row space-x-2">
                                                    <Button.Primary
                                                        onClick={() => approveRefund(refund.orderId)}
                                                        pending={approvePending}
                                                    >
                                                        Approve
                                                    </Button.Primary>
                                                    <Button.Secondary onClick={disconnect}>
                                                        Disconnect Wallet
                                                    </Button.Secondary>
                                                </div>
                                            )}
                                        </div>
                                    </Dialog.Content>
                                </Dialog.Overlay>
                            </Dialog.Portal>
                        </Dialog.Root>
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
                                        <div className="px-6 pt-6 pb-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="font-semibold text-slate-900 text-2xl">
                                                        Deny Refund
                                                    </div>
                                                    <div className="text-slate-800">
                                                        Are you sure? You can’t undo this action afterwards.
                                                    </div>

                                                    <Input
                                                        type="text"
                                                        placeholder="Enter Rejection Reason"
                                                        value={rejectReason}
                                                        onChange={e => {
                                                            setRejectReason(e.target.value);
                                                        }}
                                                    />
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
                                        <div className="bg-slate-50 p-4 flex justify-end border-t">
                                            <Button.Primary
                                                onClick={() => rejectRefund(refund.orderId)}
                                                pending={denyPending}
                                                disabled={rejectReason === ''}
                                            >
                                                Deny Refund
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
