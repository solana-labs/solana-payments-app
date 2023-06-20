import BalanceHandler from '@/components/handlers/BalanceHandler';
import CompletingHandler from '@/components/handlers/CompletingHandler';
import EnvHandler from '@/components/handlers/EnvHandler';
import PaymentDetailsHandler from '@/components/handlers/PaymentDetailsHandler';
import RouterHandler from '@/components/handlers/RouterHandler';
import SetPaymentMethodHandler from '@/components/handlers/SetPaymentMethodHandler';
import WalletHandler from '@/components/handlers/WalletHandler';
import WebsocketHandler from '@/components/handlers/WebsocketHandler';
import WindowHandler from '@/components/handlers/WindowHandler';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';

function App({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <EnvHandler />
            <WalletHandler />
            <BalanceHandler />
            <CompletingHandler />
            <PaymentDetailsHandler />
            <WindowHandler />
            <SetPaymentMethodHandler />
            <WebsocketHandler />
            <RouterHandler />
            <Component {...pageProps} />
        </Provider>
    );
}

export default App;
