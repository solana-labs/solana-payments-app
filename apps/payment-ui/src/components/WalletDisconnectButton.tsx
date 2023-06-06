import { useWallet } from '@solana/wallet-adapter-react';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import { WalletIcon } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';

export const WalletDisconnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { wallet, disconnect, disconnecting } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented) disconnect().catch(() => {});
        },
        [onClick, disconnect]
    );

    const content = useMemo(() => {
        if (children) return children;
        if (disconnecting) return 'Disconnecting ...';
        if (wallet) return 'Disconnect';
        return 'Disconnect Wallet';
    }, [children, disconnecting, wallet]);

    return (
        <div className='flex flex-row justify-center'>
            <button className='btn w-full outline outline-2 hover:bg-white bg-white text-black flex justify-center items-center normal-case' onClick={handleClick}>
                <div className='flex flex-row items-center justify-center'>
                    <Image className='pr-1' src="/logout.svg" alt="Solana Pay Logo" width={22} height={22} />
                    <div className='pl-1 text-lg'>Disconnect</div>
                </div>
            </button>
        </div>
    );
        
        
};
