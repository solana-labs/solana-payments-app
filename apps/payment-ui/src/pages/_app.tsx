import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../store';
import TimerHandler from '../components/handlers/TimerHandler'; // Import TimerHandler component
import WindowHandler from '@/components/handlers/WindowHandler';
import SetPaymentMethodHandler from '@/components/handlers/SetPaymentMethodHandler';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <Provider store={store}>
            <TimerHandler />
            <WindowHandler />
            <SetPaymentMethodHandler />
            <Component {...pageProps} />
        </Provider>
    );
}

export default MyApp;
