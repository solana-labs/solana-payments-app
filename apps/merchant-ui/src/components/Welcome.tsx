import { twMerge } from "tailwind-merge";

import { ShopifySignIn } from "./ShopifySignIn";
import { SolanaPayMark } from "./SolanaPayMark";

interface Props {
  className?: string;
}

export function Welcome(props: Props) {
  return (
    <article className={props.className}>
      <SolanaPayMark className="h-8" />
      <h1 className="text-black font-semibold text-3xl mt-6 w-full max-w-md">
        Welcome to the Solana Pay Merchant Portal
      </h1>
      <p className="mt-3 text-neutral-600 w-full max-w-md">
        Solana Pay makes it easy for you to accept Solana and USDC payments on
        your Shopify site.
      </p>
      <div className="mt-16">
        <h2 className="font-semibold text-black text-xl">
          Log in with your Shopify account
        </h2>
        <label
          className={twMerge(
            "cursor-pointer",
            "gap-x-2",
            "grid-cols-[max-content,1fr]",
            "grid",
            "items-center",
            "mt-6"
          )}
        >
          <input type="checkbox" />
          <div className="text-sm text-black font-medium">
            I agree to the{" "}
            <a
              className="text-indigo-700 font-semibold hover:underline"
              href=""
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              className="text-indigo-700 font-semibold hover:underline"
              href=""
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              Privacy Policy
            </a>
          </div>
        </label>
        <ShopifySignIn className="mt-6 w-full max-w-md" />
      </div>
    </article>
  );
}
