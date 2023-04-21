import { twMerge } from "tailwind-merge";

import { CheckmarkCircle } from "./icons/CheckmarkCircle";
import * as Button from "./Button";

interface Props {
  className?: string;
  isVerified?: boolean;
}

export function MerchantInfoAccountSetup(props: Props) {
  return (
    <div className={props.className}>
      <div className="text-sm font-medium text-black">Account Setup</div>
      <div className="grid grid-cols-[1fr,max-content] items-center mt-5">
        <div>
          <div className="text-black">Verify your business</div>
          {!props.isVerified && (
            <div className="text-sm text-neutral-600">Required • Takes ~5m</div>
          )}
        </div>
        {props.isVerified ? (
          <div className="flex items-center">
            <div className="text-black text-sm font-semibold mr-2">
              Approved
            </div>
            <CheckmarkCircle className="fill-transparent h-5 stroke-green-600 w-5" />
          </div>
        ) : (
          <Button.Primary>Start</Button.Primary>
        )}
      </div>
    </div>
  );
}
