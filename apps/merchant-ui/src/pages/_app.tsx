import { CustomToastProvider } from '@/components/ToastProvider';
import { useMerchantStore } from '@/stores/merchantStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useClosedRefundStore, useOpenRefundStore } from '@/stores/refundStore';
import '@/styles/globals.css';
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, ReactNode, useEffect, useMemo } from 'react';

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
            <CustomToastProvider>
                <TooltipProvider>
                    <Context>
                        <Component {...pageProps} />
                    </Context>
                </TooltipProvider>
            </CustomToastProvider>
        </>
    );
}

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    // const endpoint = useMemo(() => "http://localhost:8899");

    const wallets = useMemo(() => [], []);

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
