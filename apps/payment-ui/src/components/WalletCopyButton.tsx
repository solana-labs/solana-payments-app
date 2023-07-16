import * as Button from '@/components/Button';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';

export const WalletCopyButton: FC<Button.TjButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { publicKey, wallet, disconnect } = useWallet();
    const [copied, setCopied] = useState(false);

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        event => {
            if (onClick) onClick(event);
            // eslint-disable-next-line
            if (!event.defaultPrevented) disconnect().catch(() => {});
        },
        [onClick, disconnect],
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
        <Button.Secondary onClick={copyAddress} className="w-full border-2 border-black text-lg space-x-2">
            <Image src="/content_copy.svg" alt="Solana Pay Logo" width={22} height={22} />
            <div className="pl-2 text-lg">{copied ? 'Copied' : 'Copy address'}</div>
        </Button.Secondary>
    );
};
