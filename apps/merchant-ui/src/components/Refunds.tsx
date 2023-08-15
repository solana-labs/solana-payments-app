import Close from '@carbon/icons-react/lib/Close';
import Link from 'next/link';
import { useState } from 'react';
import { ClosedRefunds } from './ClosedRefunds';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { OpenRefunds } from './OpenRefunds';
import * as Tabs from './Tabs';
import { Info } from './icons/Info';

interface Props {
    className?: string;
}

export function Refunds(props: Props) {
    const [showNotification, setShowNotification] = useState(true); // Initialize state to true
    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Refunds</DefaultLayoutScreenTitle>
            <Tabs.Root defaultValue="open">
                <Tabs.List className="mt-7">
                    <Tabs.Trigger value="open">Open Requests</Tabs.Trigger>
                    <Tabs.Trigger value="closed">Closed Requests</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="open">
                    {showNotification && ( // Only render this block if showNotification is true
                        <div className="p-4 rounded-2xl bg-slate-50 mt-6 flex flex-row relative">
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2.5">
                                    <Info className="h-5 w-5 fill-slate-900" />
                                    <div className="text-black font-medium text-xs">
                                        In order to process a refund, you&apos;ll need a self-custodial wallet
                                    </div>
                                </div>
                                <div className="my-2.5 text-xs text-neutral-600">
                                    • Refunds cannot be processed with a Coinbase account
                                </div>
                                <Link className="font-semibold text-indigo-700 text-xs" href="/support">
                                    What&apos;s a self-custodial wallet?
                                </Link>

                                <Link
                                    className="font-semibold text-indigo-700 text-xs"
                                    href="https://shopifydocs.solanapay.com/merchants/refunds"
                                >
                                    How do refunds get processed?
                                </Link>
                            </div>
                            <button onClick={() => setShowNotification(false)} className="absolute right-2 top-2 p-2">
                                <Close size={20} />
                            </button>
                        </div>
                    )}

                    <OpenRefunds className="mt-9" />
                </Tabs.Content>
                <Tabs.Content value="closed">
                    <ClosedRefunds className="mt-9" />
                </Tabs.Content>
            </Tabs.Root>
        </DefaultLayoutContent>
    );
}
