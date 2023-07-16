import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import type { ButtonProps } from './Button';

export const WalletCopyButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const [copied, setCopied] = useState(false);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        event => {
            if (onClick) onClick(event);
            // eslint-disable-next-line
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
        <div className="flex flex-row justify-center">
            <button
                className="btn w-full outline-none border-2 border-black bg-white hover:bg-white text-black flex justify-center items-center normal-case"
                onClick={copyAddress}
            >
                <div className="flex flex-row items-center justify-center">
                    <Image src="/content_copy.svg" alt="Solana Pay Logo" width={18} height={18} />
                    <div className="pr-1"></div>
                    <div className="pl-1 text-lg">{copied ? 'Copied' : 'Copy address'}</div>
                </div>
            </button>
        </div>
    );
};
