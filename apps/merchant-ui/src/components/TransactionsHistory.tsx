import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { useMockTransactions } from "@/hooks/useMockTransactions";
import { formatPrice } from "@/lib/formatPrice";
import * as RE from "@/lib/Result";
import { PaginatedTable } from "./PaginatedTable";
import { TransactionsHistoryStatus } from "./TransactionsHistoryStatus";
import * as Tabs from "./Tabs";

interface Props {
  className?: string;
}

export function TransactionsHistory(props: Props) {
  const [page, setPage] = useState(0);
  const [totalNumPages, setTotalNumPages] = useState(0);
  const transactions = useMockTransactions(page);

  useEffect(() => {
    if (
      RE.isOk(transactions) &&
      transactions.data.totalPages !== totalNumPages
    ) {
      setTotalNumPages(transactions.data.totalPages);
    }
  }, [transactions]);

  if (RE.isOk(transactions) && transactions.data.totalPages === 0) {
    return (
      <div className={props.className}>
        <div>
          <div className="text-lg font-semibold md:px-7">
            Transaction History
          </div>
          <div className="mt-8 text-center">
            <div className="text-sm font-medium text-neutral-600">
              No transactions yet
            </div>
            <div className="px-12 mt-2.5 text-xs text-neutral-500 md:px-0">
              Your transactions will appear here once your store is ready.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={props.className}>
      <Tabs.Root defaultValue="all-transactions">
        <Tabs.List>
          <Tabs.Trigger value="all-transactions">Open requests</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="all-transactions">
          <PaginatedTable
            className="mt-8"
            columns={["orderId", "ts", "status", "amount"]}
            curPage={RE.map(transactions, ({ transactions }) => transactions)}
            headers={{
              amount: "Amount",
              orderId: "Shopify Order #",
              status: "Status",
              ts: "Date",
            }}
            numPages={totalNumPages}
            rowHeight="h-20"
            rowsPerPage={7}
            onPageChange={setPage}
          >
            {{
              amount: (amount) => (
                <div
                  className={twMerge(
                    "text-sm",
                    "font-semibold",
                    "pr-14",
                    amount >= 0 ? "text-gray-600" : "text-gray-400"
                  )}
                >
                  {amount >= 0 ? "+" : "-"} ${formatPrice(Math.abs(amount))}
                </div>
              ),
              orderId: (id) => (
                <div className="font-bold text-sm text-slate-600">#{id}</div>
              ),
              status: (status) => (
                <TransactionsHistoryStatus className="mr-10" status={status} />
              ),
              ts: (time) => (
                <div className="text-sm text-slate-600 pr-11">
                  {format(time, "eee h:mmaaa")}
                </div>
              ),
            }}
          </PaginatedTable>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
