import { twMerge } from "tailwind-merge";

import { FinishAccountSetupPromptListItem } from "./FinishAccountSetupPromptListItem";

export enum RemainingSetupItem {
  VerifyBusiness,
  AddStoreInformation,
  AddWallet,
}

const STEPS = [
  RemainingSetupItem.VerifyBusiness,
  RemainingSetupItem.AddStoreInformation,
  RemainingSetupItem.AddWallet,
] as const;

function getItemTitle(item: RemainingSetupItem) {
  switch (item) {
    case RemainingSetupItem.AddStoreInformation:
      return "Add store information";
    case RemainingSetupItem.AddWallet:
      return "Add a wallet";
    case RemainingSetupItem.VerifyBusiness:
      return "Verify your business";
  }
}

interface Props {
  className?: string;
  remainingSetupItems: RemainingSetupItem[];
  onBeginSetupItem?(setupItem: RemainingSetupItem): void;
}

export function FinishAccountSetupPrompt(props: Props) {
  if (!props.remainingSetupItems.length) {
    return (
      <div
        className={twMerge(
          "bg-slate-50",
          "py-5",
          "px-4",
          "text-center",
          props.className
        )}
      >
        <div className="font-semibold text-black">
          🎉 Congrats, Solana Pay is now live!
        </div>
        <div className="text-black">
          Your store now accepts Solana and USDC payments.
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge("bg-slate-50", "py-6", "px-4", props.className)}>
      <div className="text-black font-semibold text-lg">
        Finish setting up your account:
      </div>
      {STEPS.map((step, i) => (
        <FinishAccountSetupPromptListItem
          className={twMerge("py-5", i > 0 && "border-t border-slate-200")}
          completed={!props.remainingSetupItems.includes(step)}
          key={i}
          title={getItemTitle(step)}
          onStart={() => props.onBeginSetupItem?.(step)}
        />
      ))}
    </div>
  );
}
