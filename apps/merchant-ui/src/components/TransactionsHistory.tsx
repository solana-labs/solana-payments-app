import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

import { useMockTransactions } from "@/hooks/useMockTransactions";
import { abbreviateAddress } from "@/lib/abbreviateAddress";
import { formatPrice } from "@/lib/formatPrice";
import { PaginatedTable } from "./PaginatedTable";
import { TransactionsHistoryStatus } from "./TransactionsHistoryStatus";

interface Props {
  className?: string;
}

export function TransactionsHistory(props: Props) {
  const transactions = useMockTransactions();

  return (
    <div className={props.className}>
      <div className="text-lg font-semibold md:px-7">Transaction History</div>
      {transactions.length === 0 && (
        <div className="mt-8 text-center">
          <div className="text-sm font-medium text-neutral-600">
            No transactions yet
          </div>
          <div className="px-12 mt-2.5 text-xs text-neutral-500 md:px-0">
            Your transactions will appear here once your store is ready.
          </div>
        </div>
      )}
      {transactions.length > 0 && (
        <PaginatedTable
          className="mt-8 md:pr-9"
          columns={["address", "orderId", "amount", "ts", "status"]}
          data={transactions}
          headers={{
            address: "Transaction",
            amount: "Amount",
            orderId: "Shopify Order #",
            status: "Status",
            ts: "Date",
          }}
          rowHeight="h-20"
        >
          {{
            address: (address, row) => (
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 font-medium grid place-items-center">
                  {row.user.slice(0, 2).toLocaleUpperCase()}
                </div>
                <div className="ml-3 text-sm text-gray-600 font-medium">
                  {abbreviateAddress(address)}
                </div>
              </div>
            ),
            amount: (amount) => (
              <div
                className={twMerge(
                  "text-sm",
                  "font-semibold",
                  amount >= 0 ? "text-gray-600" : "text-gray-400"
                )}
              >
                {amount >= 0 ? "+" : "-"} ${formatPrice(Math.abs(amount))}
              </div>
            ),
            orderId: (id) => (
              <div className="text-sm text-slate-600">#{id}</div>
            ),
            status: (status) => <TransactionsHistoryStatus status={status} />,
            ts: (time) => (
              <div className="text-sm text-slate-600">
                {format(time, "eee h:mmaaa")}
              </div>
            ),
          }}
        </PaginatedTable>
      )}
    </div>
  );
}
