import * as Tooltip from '@radix-ui/react-tooltip';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Input } from './Input';
import { AccountBalanceWallet } from './icons/AccountBalanceWallet';

interface Props {
    className?: string;
    value: string;
    onChange?(value: string): void;
    addressChanged?: boolean | string | null;
    setAddressChanged?(value: boolean): void;
    addressIsInvalid: boolean;
}

export function AddressInput(props: Props) {
    const [copied, setCopied] = useState(false);
    const copyRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (copyRef.current) {
                clearTimeout(copyRef.current);
            }
        };
    }, []);

    return (
        <div className={props.className}>
            <div
                className={twMerge(
                    'border-gray-300',
                    'border',
                    'grid-cols-[max-content,1fr]',
                    'grid',
                    'overflow-hidden',
                    'rounded-lg',
                )}
            >
                <Tooltip.Root open={copied}>
                    <Tooltip.Trigger
                        className={twMerge(
                            'grid',
                            'h-11',
                            'place-items-center',
                            'transition-colors',
                            'w-11',
                            'disabled:opacity-50',
                            'hover:bg-gray-50',
                            'disabled:hover:bg-transparent',
                        )}
                        disabled={props.addressIsInvalid}
                        onClick={async () => {
                            try {
                                if (copyRef.current) {
                                    clearTimeout(copyRef.current);
                                }

                                setCopied(true);
                                await navigator.clipboard.writeText(props.value);

                                copyRef.current = window.setTimeout(() => {
                                    setCopied(false);
                                }, 1000);
                            } catch {
                                // pass
                            }
                        }}
                    >
                        <AccountBalanceWallet className="fill-slate-400 h-6 w-6" />
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                        <Tooltip.Content className="bg-white rounded drop-shadow-md px-2 py-1 text-xs text-emerald-500">
                            <Tooltip.Arrow className="fill-white" />
                            Copied!
                        </Tooltip.Content>
                    </Tooltip.Portal>
                </Tooltip.Root>
                <Input
                    className={twMerge('border-b-0', 'border-l', 'border-r-0', 'border-t-0', 'rounded-none', 'w-full')}
                    value={props.value}
                    onChange={e => {
                        props.onChange?.(e.currentTarget.value);
                    }}
                />
            </div>
            {props.addressIsInvalid && <div className="mt-2 text-xs text-red-500">Not a valid wallet address.</div>}
            {props.addressChanged && props.addressChanged === true && (
                <p className="text-emerald-700 text-xs">Wallet updated successfully</p>
            )}
            {props.addressChanged && typeof props.addressChanged === 'string' && (
                <p className="text-red-500 text-xs">{props.addressChanged}</p>
            )}
        </div>
    );
}
