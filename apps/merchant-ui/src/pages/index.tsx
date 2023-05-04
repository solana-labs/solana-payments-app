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
        className={twMerge("grid", "h-screen", "w-screen", "md:grid-cols-2")}
      >
        <div className="flex justify-center py-9 px-24 md:justify-end">
          <Welcome className="pt-14" />
        </div>
        <div
          className={twMerge(
            "h-full",
            "hidden",
            "justify-end",
            "overflow-hidden",
            "md:flex"
          )}
        >
          <WelcomeHero className="h-full w-full" />
        </div>
      </div>
    </>
  );
}
