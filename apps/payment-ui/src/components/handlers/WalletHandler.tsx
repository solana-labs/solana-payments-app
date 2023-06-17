import { setBackendUrlEnv, setWebsocketUrlEnv } from "@/features/env/envSlice";
import { AppDispatch } from "@/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getWalletPubkey, fetchWalletBalance } from '@/features/wallet/walletSlice';

const WalletHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const pubkey = useSelector(getWalletPubkey);

    useEffect(() => {

        if (pubkey) {
            dispatch(fetchWalletBalance(pubkey))
        }

    }, [dispatch, pubkey]);

    return null;
};

export default WalletHandler;
