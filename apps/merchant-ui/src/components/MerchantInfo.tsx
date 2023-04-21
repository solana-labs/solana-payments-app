import { twMerge } from "tailwind-merge";
import { useState } from "react";

import { DefaultLayoutScreenTitle } from "./DefaultLayoutScreenTitle";
import { DefaultLayoutContent } from "./DefaultLayoutContent";
import { DefaultLayoutHeader } from "./DefaultLayoutHeader";
import { MerchantInfoAccountSetup } from "./MerchantInfoAccountSetup";
import { MerchantInfoForm, Data as FormData } from "./MerchantInfoForm";
import { Token } from "./TokenSelect";
import * as Button from "./Button";

interface Props {
  className?: string;
}

export function MerchantInfo(props: Props) {
  const [formState, setFormState] = useState<FormData>({
    name: "[shopify id]",
    logoSrc: "",
    walletAddress: "",
    token: Token.USDC,
  });

  return (
    <DefaultLayoutContent className={props.className}>
      <DefaultLayoutScreenTitle>Merchant Info</DefaultLayoutScreenTitle>
      <DefaultLayoutHeader className="mt-24">
        Business Verification
      </DefaultLayoutHeader>
      <MerchantInfoAccountSetup className="mt-9 pb-9 border-b border-gray-200" />
      <DefaultLayoutHeader className="mt-12">
        Required Information
      </DefaultLayoutHeader>
      <MerchantInfoForm
        className="pt-9 border-b border-gray-200"
        data={formState}
        onChange={setFormState}
      />
      <footer className="flex items-center justify-end space-x-3 pt-4">
        <Button.Secondary>Cancel</Button.Secondary>
        <Button.Primary>Save</Button.Primary>
      </footer>
    </DefaultLayoutContent>
  );
}
