import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { FC, ReactNode, useEffect, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import {
    BackpackWalletAdapter,
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMerchantStore } from '@/stores/merchantStore';
import { useClosedRefundStore, useOpenRefundStore } from '@/stores/refundStore';
import { get } from 'http';
import { usePaymentStore } from '@/stores/paymentStore';

export default function App({ Component, pageProps }: AppProps) {
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const getOpenRefunds = useOpenRefundStore(state => state.getOpenRefunds);
    const getClosedRefunds = useClosedRefundStore(state => state.getClosedRefunds);
    const getPayments = usePaymentStore(state => state.getPayments);

    useEffect(() => {
        getMerchantInfo().catch(console.error); // Fetch merchantInfo when App loads
        getOpenRefunds(0).catch(console.error); // Fetch open refunds when App loads
        getClosedRefunds(0).catch(console.error); // Fetch open refunds when App loads
        getPayments(0).catch(console.error); // Fetch open refunds when App loads
    }, [getMerchantInfo]); // Dependency array

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <TooltipProvider>
                <Context>
                    <Component {...pageProps} />
                </Context>
            </TooltipProvider>
        </>
    );
}

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // const endpoint = useMemo(() => "http://localhost:8899");

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SlopeWalletAdapter(),
            new BackpackWalletAdapter(),
            new GlowWalletAdapter(),
        ],
        []
    );

    return (
        <div>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>{children}</WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
};
