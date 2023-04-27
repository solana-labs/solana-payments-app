import Head from "next/head";

import { DefaultLayout } from "@/components/DefaultLayout";
import { WalletsSettlement } from "@/components/WalletsSettlement";

export default function Wallets() {
  return (
    <>
      <Head>
        <title>Solana Pay - Wallets</title>
        <meta name="description" content="Configure your wallets" />
      </Head>
      <div className="h-screen w-screen">
        <DefaultLayout className="h-full w-full">
          <WalletsSettlement />
        </DefaultLayout>
      </div>
    </>
  );
}
