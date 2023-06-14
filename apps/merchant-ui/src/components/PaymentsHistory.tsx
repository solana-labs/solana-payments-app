import * as RE from '@/lib/Result';
import { formatPrice } from '@/lib/formatPrice';
import { useMerchantStore } from '@/stores/merchantStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { MdSyncProblem } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import { PaginatedTable } from './PaginatedTable';
import { PaymentsHistoryStatus } from './PaymentsHistoryStatus';
import * as Tabs from './Tabs';

interface Props {
    className?: string;
}

export function PaymentsHistory(props: Props) {
    const [page, setPage] = useState(0);
    const [totalNumPages, setTotalNumPages] = useState(0);

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const payments = usePaymentStore(state => state.payments);
    const getPayments = usePaymentStore(state => state.getPayments);

    const pageRef = useRef(page);

    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    useEffect(() => {
        if (RE.isOk(payments) && payments.data.totalPages !== totalNumPages) {
            setTotalNumPages(payments.data.totalPages);
        }
    }, [payments]);

    useEffect(() => {
        getPayments(page);

        const intervalId = setInterval(() => {
            getPayments(pageRef.current);
        }, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

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

    if (RE.isFailed(payments)) {
        return (
            <div className={props.className}>
                <div className="flex flex-col justify-center h-full text-red-700 items-center space-y-4">
                    <MdSyncProblem size={36} />
                    <p>We're having trouble loading your closed refunds data</p>
                </div>
            </div>
        );
    }

    if (RE.isOk(payments) && payments.data.payments.length === 0) {
        return (
            <div className={props.className}>
                <div>
                    <div className="text-lg font-semibold md:px-7">Payment History</div>
                    <div className="mt-8 text-center">
                        <div className="text-sm font-medium text-neutral-600">No payments yet</div>
                        <div className="px-12 mt-2.5 text-xs text-neutral-500 md:px-0">
                            Your payments will appear here once your store is ready.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={props.className}>
            <Tabs.Root defaultValue="all-payments">
                <Tabs.List>
                    <Tabs.Trigger value="all-payments">All Payments</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="all-payments">
                    <PaginatedTable
                        className="mt-8"
                        columns={['orderId', 'requestedAt', 'status', 'amount']}
                        curPage={RE.map(payments, ({ payments }) => payments)}
                        headers={{
                            amount: 'Amount',
                            orderId: 'Shopify Order #',
                            status: 'Status',
                            requestedAt: 'Date',
                        }}
                        numPages={totalNumPages}
                        rowHeight="h-20"
                        rowsPerPage={7}
                        onPageChange={e => {
                            setPage(e);
                            getPayments(e);
                        }}
                    >
                        {{
                            amount: amount => (
                                <div
                                    className={twMerge(
                                        'text-sm',
                                        'font-semibold',
                                        'pr-14',
                                        amount >= 0 ? 'text-gray-600' : 'text-gray-400'
                                    )}
                                >
                                    ${formatPrice(Math.abs(amount))}
                                </div>
                            ),
                            orderId: id => <div className="font-bold text-sm text-slate-600">#{id}</div>,
                            status: status => <PaymentsHistoryStatus className="mr-10" status={status} />,
                            requestedAt: requestedAt => (
                                <div className="text-sm text-slate-600 pr-11">
                                    {format(requestedAt, 'MMM d, h:mmaa')}
                                </div>
                            ),
                        }}
                    </PaginatedTable>
                </Tabs.Content>
            </Tabs.Root>
        </div>
    );
}
