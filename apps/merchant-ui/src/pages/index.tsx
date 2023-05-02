import Head from "next/head";
import { twMerge } from "tailwind-merge";

import { WelcomeHero } from "@/components/WelcomeHero";
import { Welcome } from "@/components/Welcome";

export default function Home() {
  return (
    <>
      <Head>
        <title>Solana Pay Merchant Portal</title>
        <meta
          name="description"
          content="Solana Pay makes it easy for you to accept Solana and USDC payments on your Shopify site."
        />
      </Head>
      <div
        className={twMerge(
          "gap-x-28",
          "grid",
          "h-screen",
          "p-9",
          "w-screen",
          "md:grid-cols-2"
        )}
      >
        <div
          className={twMerge(
            "h-full",
            "hidden",
            "justify-end",
            "overflow-hidden",
            "md:flex"
          )}
        >
          <WelcomeHero className="h-full w-full max-w-xl" />
        </div>
        <div className="flex justify-center md:justify-start">
          <Welcome className="pt-14" />
        </div>
      </div>
    </>
  );
}
