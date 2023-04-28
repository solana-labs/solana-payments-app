import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

import { Input } from "./Input";
import { AccountBalanceWallet } from "./icons/AccountBalanceWallet";

interface Props {
  className?: string;
  defaultValue?: null | PublicKey;
  onChange?(value: null | PublicKey): void;
}

export function AddressInput(props: Props) {
  const [addressText, setAddressText] = useState(
    props.defaultValue?.toBase58() || ""
  );
  const [addressIsInvalid, setAddressIsInvalid] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyRef = useRef<number | null>(null);

  useEffect(() => {
    const newAddressText = props.defaultValue?.toBase58() || "";

    if (newAddressText && newAddressText !== addressText) {
      setAddressText(newAddressText);
    }
  }, [props.defaultValue]);

  useEffect(() => {
    return () => {
      if (copyRef.current) {
        clearTimeout(copyRef.current);
      }
    };
  }, []);

  return (
    <div className={props.className}>
      <div
        className={twMerge(
          "border-gray-300",
          "border",
          "grid-cols-[max-content,1fr]",
          "grid",
          "overflow-hidden",
          "rounded-lg"
        )}
      >
        <Tooltip.Root open={copied}>
          <Tooltip.Trigger
            className={twMerge(
              "grid",
              "h-11",
              "place-items-center",
              "transition-colors",
              "w-11",
              "disabled:opacity-50",
              "hover:bg-gray-50",
              "disabled:hover:bg-transparent"
            )}
            disabled={!addressText || addressIsInvalid}
            onClick={async () => {
              try {
                if (copyRef.current) {
                  clearTimeout(copyRef.current);
                }

                setCopied(true);
                await navigator.clipboard.writeText(addressText);

                copyRef.current = window.setTimeout(() => {
                  setCopied(false);
                }, 1000);
              } catch {
                // pass
              }
            }}
          >
            <AccountBalanceWallet className="fill-slate-400 h-6 w-6" />
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-white rounded drop-shadow-md px-2 py-1 text-xs text-emerald-500">
              <Tooltip.Arrow className="fill-white" />
              Copied!
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <Input
          className={twMerge(
            "border-b-0",
            "border-l",
            "border-r-0",
            "border-t-0",
            "rounded-none",
            "w-full"
          )}
          value={addressText}
          onBlur={() => {
            try {
              if (addressText) {
                const address = new PublicKey(addressText);
                setAddressIsInvalid(false);
                props.onChange?.(address);
              } else {
                setAddressIsInvalid(false);
                props.onChange?.(null);
              }
            } catch {
              setAddressIsInvalid(true);
              props.onChange?.(null);
            }
          }}
          onChange={(e) => {
            setAddressIsInvalid(false);
            setAddressText(e.currentTarget.value);
          }}
        />
      </div>
      {addressIsInvalid && (
        <div className="mt-2 text-xs text-red-500">
          Not a valid wallet address.
        </div>
      )}
    </div>
  );
}
