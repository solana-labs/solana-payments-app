import { removeNotification } from '@/features/notification/notificationSlice';
import { fetchWalletBalance } from '@/features/wallet/walletSlice';
import { AppDispatch } from '@/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const WalletHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            dispatch(fetchWalletBalance(publicKey.toBase58()));
        } else {
            dispatch(removeNotification());
        }
    }, [dispatch, publicKey]);

    return null;
};

export default WalletHandler;
