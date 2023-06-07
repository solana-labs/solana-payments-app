import Link from 'next/link';
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
    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Refunds</DefaultLayoutScreenTitle>
            <Tabs.Root defaultValue="open">
                <Tabs.List className="mt-7">
                    <Tabs.Trigger value="open">Open Requests</Tabs.Trigger>
                    <Tabs.Trigger value="closed">Closed Requests</Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="open">
                    <div className="p-4 rounded-2xl bg-slate-50 mt-6 inline-block">
                        <div className="flex items-center space-x-2.5">
                            <Info className="h-5 w-5 fill-slate-900" />
                            <div className="text-black font-medium text-xs">
                                In order to process a refund, you'll need a self-custodial wallet
                            </div>
                        </div>
                        <div className="my-2.5 text-xs text-neutral-600">
                            • Usually a wallet app on Solana, like Solflare or Phantom
                            <br />• Refunds cannot be processed with a Coinbase account
                        </div>
                        <Link className="font-semibold text-indigo-700 text-xs" href="/support">
                            What's a self-custodial wallet?
                        </Link>
                    </div>
                    <OpenRefunds className="mt-9" />
                </Tabs.Content>
                <Tabs.Content value="closed">
                    <ClosedRefunds className="mt-9" />
                </Tabs.Content>
            </Tabs.Root>
        </DefaultLayoutContent>
    );
}
