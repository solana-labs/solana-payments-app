import * as RE from '@/lib/Result';
import { formatPrice } from '@/lib/formatPrice';
import { usePaymentStore } from '@/stores/paymentStore';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
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
    const payments = usePaymentStore(state => state.payments);

    useEffect(() => {
        if (RE.isOk(payments) && payments.data.totalPages !== totalNumPages) {
            setTotalNumPages(payments.data.totalPages);
        }
    }, [payments]);

    // console.log('payments', payments.data.totalPages);
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
                    <Tabs.Trigger value="all-payments">Open requests</Tabs.Trigger>
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
                        onPageChange={setPage}
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
