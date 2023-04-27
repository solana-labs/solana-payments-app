import { twMerge } from "tailwind-merge";

import { DefaultLayoutScreenTitle } from "./DefaultLayoutScreenTitle";
import { DefaultLayoutContent } from "./DefaultLayoutContent";
import {
  FinishAccountSetupPrompt,
  RemainingSetupItem,
} from "./FinishAccountSetupPrompt";
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
      <FinishAccountSetupPrompt
        className="-mt-8 -mx-4 md:mx-0 md:mt-7 md:rounded-lg"
        remainingSetupItems={[
          RemainingSetupItem.AddStoreInformation,
          RemainingSetupItem.AddWallet,
        ]}
      />
      <DefaultLayoutScreenTitle className="block mt-8 md:hidden">
        Transactions
      </DefaultLayoutScreenTitle>
      <TransactionsOverview className="mt-9" />
      <TransactionsHistory className="mt-9" />
    </DefaultLayoutContent>
  );
}
