import { twMerge } from "tailwind-merge";

import { DefaultLayoutScreenTitle } from "./DefaultLayoutScreenTitle";
import { DefaultLayoutContent } from "./DefaultLayoutContent";
import { TransactionsOverview } from "./TransactionsOverview";
import { TransactionsHistory } from "./TransactionsHistory";

interface Props {
  className?: string;
}

export function Transactions(props: Props) {
  return (
    <DefaultLayoutContent className={props.className}>
      <DefaultLayoutScreenTitle className="hidden md:block">
        Transactions
      </DefaultLayoutScreenTitle>
      <DefaultLayoutScreenTitle className="block mt-8 md:hidden">
        Transactions
      </DefaultLayoutScreenTitle>
      <TransactionsHistory className="mt-9" />
    </DefaultLayoutContent>
  );
}
