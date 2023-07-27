import CompletingHandler from '@/components/handlers/CompletingHandler';
import PaymentDetailsHandler from '@/components/handlers/PaymentDetailsHandler';
import RouterHandler from '@/components/handlers/RouterHandler';
import WalletHandler from '@/components/handlers/WalletHandler';
import WebsocketHandler from '@/components/handlers/WebsocketHandler';
import WindowHandler from '@/components/handlers/WindowHandler';
import '@/styles/globals.css';
import '@/styles/wallet.css';
import {
    SolanaMobileWalletAdapter,
    createDefaultAddressSelector,
    createDefaultAuthorizationResultCache,
    createDefaultWalletNotFoundHandler,
} from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import type { AppProps } from 'next/app';
import { FC, ReactNode, useMemo } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <WalletContext>
                <WalletHandler />
                <CompletingHandler />
                <PaymentDetailsHandler />
                <WindowHandler />
                <WebsocketHandler />
                <RouterHandler />
                <Component {...pageProps} />
            </WalletContext>
        </Provider>
    );
}

const WalletContext: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new SolflareWalletAdapter(),
            new PhantomWalletAdapter(),
            new SolanaMobileWalletAdapter({
                addressSelector: createDefaultAddressSelector(),
                appIdentity: {
                    name: 'Solana Pay Payment Portal',
                    uri: 'https://pay.solanapay.com',
                    icon: '/favicon.ico',
                },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
                cluster: WalletAdapterNetwork.Mainnet,
                onWalletNotFound: createDefaultWalletNotFoundHandler(),
            }),
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
