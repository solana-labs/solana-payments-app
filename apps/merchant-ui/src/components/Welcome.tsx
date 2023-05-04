import { twMerge } from "tailwind-merge";

import { ShopifySignIn } from "./ShopifySignIn";
import { SolanaPayMark } from "./SolanaPayMark";

interface Props {
  className?: string;
}

export function Welcome(props: Props) {
  return (
    <article className={props.className}>
      <SolanaPayMark className="h-8 mb-56" />
      <h1 className="text-black font-semibold text-3xl mt-6 w-full max-w-md">
        Welcome to the Solana Pay Merchant Portal
      </h1>
      <p className="mt-3 text-neutral-600 w-full max-w-md">
        Solana Pay makes it easy for you to accept Solana and USDC payments on
        your Shopify site.
      </p>
      <ShopifySignIn className="mt-10 w-full max-w-md" />
    </article>
  );
}
