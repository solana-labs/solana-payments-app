import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { store } from "../store";
import TimerHandler from "../components/TimerHandler"; // Import TimerHandler component
import { RedirectHandler } from "@/components/RedirectHandler";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <TimerHandler />
      <RedirectHandler />
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
