import { twMerge } from "tailwind-merge";
import type { PublicKey } from "@solana/web3.js";
import { useState } from "react";
import { produce } from "immer";

import { DefaultLayoutScreenTitle } from "./DefaultLayoutScreenTitle";
import { DefaultLayoutContent } from "./DefaultLayoutContent";
import { DefaultLayoutHeader } from "./DefaultLayoutHeader";
import { AddressInput } from "./AddressInput";
import { Token, TokenSelect } from "./TokenSelect";
import * as Button from "./Button";

interface FormState {
  address: null | PublicKey;
  settlementToken: Token;
}

interface Props {
  className?: string;
}

export function WalletsSettlement(props: Props) {
  const [formState, setFormState] = useState<FormState>({
    address: null,
    settlementToken: Token.Sol,
  });

  return (
    <DefaultLayoutContent className={props.className}>
      <DefaultLayoutScreenTitle>Wallets & Settlement</DefaultLayoutScreenTitle>
      <div className="mt-24 gap-x-8 lg:grid lg:grid-cols-[max-content,1fr]">
        <DefaultLayoutHeader className="col-span-2 mb-9">
          My Wallets
        </DefaultLayoutHeader>
        <div className="max-w-[280px]">
          <div className="text-sm font-medium text-black">
            Payment Receipt Address
          </div>
          <div className="text-sm text-neutral-600">
            Automatically receive all payments to this address.
          </div>
        </div>
        <AddressInput
          className="mt-4 w-full lg:mt-0"
          defaultValue={formState.address}
          onChange={(address) => {
            const newFormState = produce(formState, (data) => {
              data.address = address;
            });

            setFormState(newFormState);
          }}
        />
        <DefaultLayoutHeader className="mt-16 mb-9 col-span-2">
          Settlement
        </DefaultLayoutHeader>
        <div className="max-w-[280px]">
          <div className="text-sm font-medium text-black">Settlement Token</div>
          <div className="text-sm text-neutral-600">
            Select which token you receive from customers.
          </div>
        </div>
        <TokenSelect
          className="mt-4 w-full lg:mt-0"
          token={formState.settlementToken}
          onChange={(token) => {
            const newFormState = produce(formState, (data) => {
              data.settlementToken = token;
            });

            setFormState(newFormState);
          }}
        />
      </div>
      <footer
        className={twMerge(
          "border-gray-200",
          "border-t",
          "flex",
          "items-center",
          "justify-end",
          "mt-5",
          "pt-5",
          "space-x-3"
        )}
      >
        <Button.Secondary>Cancel</Button.Secondary>
        <Button.Primary>Save</Button.Primary>
      </footer>
    </DefaultLayoutContent>
  );
}
