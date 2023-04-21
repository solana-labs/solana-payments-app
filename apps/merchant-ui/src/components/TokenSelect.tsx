import { twMerge } from "tailwind-merge";
import * as Select from "@radix-ui/react-select";

import { ChevronDown } from "./icons/ChevronDown";
import { Check } from "./icons/Check";

export enum Token {
  Sol,
  USDC,
}

function getTokenName(token: Token): string {
  switch (token) {
    case Token.Sol:
      return "Solana";
    case Token.USDC:
      return "USD Coin";
  }
}

function getTokenSymbol(token: Token) {
  switch (token) {
    case Token.Sol:
      return "SOL";
    case Token.USDC:
      return "USDC";
  }
}

function symbolToToken(symbol: ReturnType<typeof getTokenSymbol>): Token {
  switch (symbol) {
    case "SOL":
      return Token.Sol;
    case "USDC":
      return Token.USDC;
  }
}

interface Props {
  allowedTokens: Token[];
  className?: string;
  disabled?: boolean;
  token: Token;
  onChange?(token: Token): void;
}

export function TokenSelect(props: Props) {
  return (
    <Select.Root
      onValueChange={(value: ReturnType<typeof getTokenSymbol>) =>
        props.onChange?.(symbolToToken(value))
      }
      value={getTokenSymbol(props.token)}
    >
      <Select.Trigger
        className={twMerge(
          "border-gray-300",
          "border",
          "gap-x-2",
          "grid-cols-[1fr,max-content]",
          "grid",
          "h-11",
          "items-center",
          "px-3",
          "rounded-md",
          "transition-colors",
          !props.disabled && "hover:bg-slate-50",
          props.disabled && "bg-gray-100",
          props.disabled && "cursor-not-allowed",
          props.className
        )}
        disabled={props.disabled}
      >
        <Select.Value asChild>
          <div className="flex items-center">
            <div className="font-medium text-black mr-2">
              {getTokenSymbol(props.token)}
            </div>
            <div className="text-slate-600">{getTokenName(props.token)}</div>
          </div>
        </Select.Value>
        {!props.disabled && (
          <Select.Icon>
            <ChevronDown className="fill-black h-5 w-5" />
          </Select.Icon>
        )}
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={twMerge(
            "bg-white",
            "border",
            "border-gray-300",
            "overflow-hidden",
            "p-1.5",
            "rounded-md"
          )}
        >
          <Select.ScrollUpButton />
          <Select.Viewport>
            {props.allowedTokens.map((token) => (
              <Select.Item
                className={twMerge(
                  "cursor-pointer",
                  "gap-x-2",
                  "grid-cols-[1fr,max-content]",
                  "grid",
                  "px-1.5",
                  "h-11",
                  "outline-none",
                  "items-center",
                  "rounded-md",
                  "transition-colors",
                  "hover:bg-slate-50",
                  "focus:bg-slate-50"
                )}
                key={token}
                value={getTokenSymbol(token)}
              >
                <Select.ItemText asChild>
                  <div className="flex items-center">
                    <div className="font-medium text-black mr-2">
                      {getTokenSymbol(token)}
                    </div>
                    <div className="text-slate-600">{getTokenName(token)}</div>
                  </div>
                </Select.ItemText>
                {token === props.token && (
                  <Select.ItemIndicator>
                    <Check className="fill-indigo-600 h-5 w-5" />
                  </Select.ItemIndicator>
                )}
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

TokenSelect.defaultProps = {
  allowedTokens: [Token.Sol, Token.USDC],
};
