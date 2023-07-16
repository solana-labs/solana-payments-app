import * as Button from '@/components/Button';
import { setWalletDisconnected } from '@/features/wallet/walletSlice';
import { AppDispatch } from '@/store';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import type { FC, MouseEventHandler } from 'react';
import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { TjButtonProps } from './Button';

export const WalletDisconnectButton: FC<TjButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { wallet, disconnect, disconnecting } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        event => {
            if (onClick) {
                // onClick(event);
                // dispatch(removeNotification())
                // dispatch(setWalletDisconnected())
            }
            // eslint-disable-next-line
            if (!event.defaultPrevented)
                disconnect()
                    .then(() => {
                        dispatch(setWalletDisconnected());
                    })
                    .catch(() => {});
        },
        [onClick, disconnect],
    );

    const content = useMemo(() => {
        if (children) return children;
        if (disconnecting) return 'Disconnecting ...';
        if (wallet) return 'Disconnect';
        return 'Disconnect Wallet';
    }, [children, disconnecting, wallet]);

    return (
        <Button.Secondary onClick={handleClick} className="w-full border-2 border-black text-lg space-x-2">
            <Image src="/logout.svg" alt="logout icon" width={22} height={22} />
            <div className="pl-2 text-lg">Disconnect</div>
        </Button.Secondary>
    );
};
