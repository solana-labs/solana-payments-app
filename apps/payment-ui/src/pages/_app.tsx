import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import WindowHandler from '@/components/handlers/WindowHandler';
import SetPaymentMethodHandler from '@/components/handlers/SetPaymentMethodHandler';
import WebsocketHandler from '@/components/handlers/WebsocketHandler';
import RouterHandler from '@/components/handlers/RouterHandler';
import SolanaPayHandler from '@/components/handlers/SolanaPayHandler';
import EnvHandler from '@/components/handlers/EnvHandler';
import PaymentDetailsHandler from '@/components/handlers/PaymentDetailsHandler';
import WalletHandler from '@/components/handlers/WalletHandler';

function App({ Component, pageProps }: AppProps) {

    console.log('RENDER')

    return (
        <Provider store={store}>
            <EnvHandler />
            <WalletHandler />
            <PaymentDetailsHandler />
            <SolanaPayHandler />
            <WindowHandler />
            <SetPaymentMethodHandler />
            <WebsocketHandler />
            <RouterHandler />
            <Component {...pageProps} />
        </Provider>
    );
}

export default App;
