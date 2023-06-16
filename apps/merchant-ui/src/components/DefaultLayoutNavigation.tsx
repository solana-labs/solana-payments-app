import { LoadingDots } from '@/components/LoadingDots';
import { isFailed, isOk, isPending } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import { useOpenRefundStore } from '@/stores/refundStore';
import User from '@carbon/icons-react/lib/User';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { DefaultLayoutNavigationExternalLink } from './DefaultLayoutNavigationExternalLink';
import { DefaultLayoutNavigationLink } from './DefaultLayoutNavigationLink';
import { RefundCount } from './RefundCount';
import { SolanaPayMark } from './SolanaPayMark';
import { Description } from './icons/Description';
import { Flag } from './icons/Flag';
import { Folder } from './icons/Folder';
import { ReceiptLong } from './icons/ReceiptLong';
import { Reply } from './icons/Reply';
import { Store } from './icons/Store';
import { Support } from './icons/Support';

interface Props {
    accountIsActive?: boolean;
    className?: string;
}

export function DefaultLayoutNavigation(props: Props) {
    const refundCount = useOpenRefundStore(state => state.refundCount);
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    return (
        <NavigationMenu.Root
            className={twMerge(
                'bg-white',
                'border-r',
                'border-slate-200',
                'bottom-0',
                'fixed',
                'flex-col',
                'flex',
                'h-full',
                'justify-between',
                'left-0',
                'max-w-xs',
                'px-6',
                'py-8',
                'top-0',
                'transition-transform',
                'w-[85%]',
                'z-10',
                'md:max-w-none',
                'md:w-auto',
                'md:bottom-auto',
                'md:left-auto',
                'md:relative',
                'md:top-auto',
                'md:translate-x-0',
                props.className
            )}
            orientation="vertical"
        >
            <NavigationMenu.List className="pr-6">
                <NavigationMenu.Item>
                    <NavigationMenu.Link asChild>
                        <Link href="/">
                            <SolanaPayMark className="h-7" />
                        </Link>
                    </NavigationMenu.Link>
                </NavigationMenu.Item>
                <div className="mt-16 pb-6 border-b border-slate-200">
                    {isOk(merchantInfo) && (
                        <div className="text-black font-semibold text-lg">{merchantInfo.data.name} </div>
                    )}
                    {isPending(merchantInfo) && <LoadingDots />}
                    {isFailed(merchantInfo) && <DefaultLayoutNavigationLink href="/" icon={<User />} text="Sign In" />}
                </div>
                {isPending(merchantInfo) && (
                    <div className="mt-6">
                        <LoadingDots />
                    </div>
                )}
                {isOk(merchantInfo) && (
                    <>
                        {merchantInfo.data.completed ? (
                            <div className="mt-6">
                                <DefaultLayoutNavigationLink href="/payments" icon={<ReceiptLong />} text="Payments" />
                                <DefaultLayoutNavigationLink
                                    href="/refunds"
                                    icon={<Reply />}
                                    text="Refunds"
                                    renderInRhs={<RefundCount refundCount={refundCount} />}
                                />
                                <DefaultLayoutNavigationLink href="/merchant" icon={<Store />} text="Merchant Info" />
                                <DefaultLayoutNavigationLink href="/support" icon={<Support />} text="Support" />
                            </div>
                        ) : (
                            <div className="mt-6">
                                <DefaultLayoutNavigationLink
                                    href="/getting-started"
                                    icon={<Flag />}
                                    text="Getting Started"
                                />
                                <DefaultLayoutNavigationLink href="/support" icon={<Support />} text="Support" />
                            </div>
                        )}
                    </>
                )}
            </NavigationMenu.List>
            <NavigationMenu.List>
                <div className="pr-6">
                    <DefaultLayoutNavigationExternalLink href="/docs" icon={<Folder />} text="Documentation" />
                </div>
                <div className="pr-6">
                    <DefaultLayoutNavigationExternalLink
                        className="bg-slate-600"
                        href="/tos"
                        icon={<Description />}
                        text="Terms of Service"
                    />
                </div>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
