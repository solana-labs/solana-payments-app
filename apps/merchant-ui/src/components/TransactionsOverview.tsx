import { twMerge } from "tailwind-merge";

import { TransactionsOverviewItem } from "./TransactionsOverviewItem";

interface Props {
  className?: string;
}

export function TransactionsOverview(props: Props) {
  return (
    <div
      className={twMerge(
        "flex-col",
        "flex",
        "gap-x-6",
        "gap-y-5",
        "md:flex-row",
        props.className
      )}
    >
      <TransactionsOverviewItem
        className="md:w-1/3"
        title="Transactions"
        value={0}
      />
      <TransactionsOverviewItem
        className="md:w-1/3"
        title="Total Revenue"
        value={0}
      />
      <TransactionsOverviewItem
        className="md:w-1/3"
        title="Unique Buyers"
        value={0}
      />
    </div>
  );
}
