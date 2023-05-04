import Head from "next/head";

import { DefaultLayout } from "@/components/DefaultLayout";
import { Transactions as TransactionsScreen } from "@/components/Transactions";

export default function Transactions() {
  return (
    <>
      <Head>
        <title>Solana Pay - Transactions</title>
        <meta name="description" content="View your transactions" />
      </Head>
      <div className="h-screen w-screen">
        <DefaultLayout accountIsActive className="h-full w-full">
          <TransactionsScreen />
        </DefaultLayout>
      </div>
    </>
  );
}
