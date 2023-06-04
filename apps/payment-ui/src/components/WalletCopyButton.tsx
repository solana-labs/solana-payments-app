import { useWallet } from '@solana/wallet-adapter-react';
import { FC, MouseEventHandler, useState } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button';
import { Button } from './Button';
import { WalletIcon } from '@solana/wallet-adapter-react-ui';

export const WalletCopyButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const [copied, setCopied] = useState(false);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented) disconnect().catch(() => {});
        },
        [onClick, disconnect]
    );

    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);


    const copyAddress = useCallback(async () => {
        if (base58) {
            await navigator.clipboard.writeText(base58);
            setCopied(true);
            setTimeout(() => setCopied(false), 400);
        }
    }, [base58]);

    return (
        <div className='flex flex-row justify-center'>
            <button className='btn w-full btn-outline bg-white text-black flex justify-center items-center normal-case' onClick={copyAddress}>
                {copied ? 'Copied' : 'Copy address'}
            </button>
        </div>
    );
        
        
};
