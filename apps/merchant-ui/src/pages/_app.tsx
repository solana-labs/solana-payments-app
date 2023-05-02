import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TooltipProvider>
        <Component {...pageProps} />
      </TooltipProvider>
    </>
  );
}
