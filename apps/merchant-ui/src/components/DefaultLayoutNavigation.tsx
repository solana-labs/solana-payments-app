import { LoadingDots } from '@/components/LoadingDots';
import { isFailed, isOk, isPending } from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { useMerchantStore } from '@/stores/merchantStore';
import { useOpenRefundStore } from '@/stores/refundStore';
import Logout from '@carbon/icons-react/lib/Logout';
import Policy from '@carbon/icons-react/lib/Policy';
import RuleDataQuality from '@carbon/icons-react/lib/RuleDataQuality';
import User from '@carbon/icons-react/lib/User';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cloneElement } from 'react';
import { twMerge } from 'tailwind-merge';
import { DefaultLayoutNavigationExternalLink } from './DefaultLayoutNavigationExternalLink';
import { DefaultLayoutNavigationLink } from './DefaultLayoutNavigationLink';
import { RefundCount } from './RefundCount';
import { SolanaPayMark } from './SolanaPayMark';
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
    const router = useRouter();

    async function logout() {
        const response = await fetch(`${API_ENDPOINTS.logout} `, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.status === 200) {
            router.push('/');
        }
    }

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
                                <DefaultLayoutNavigationLink href="/merchant" icon={<Store />} text="Merchant" />
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
            <NavigationMenu.List className="pr-6">
                <DefaultLayoutNavigationExternalLink href="/docs" icon={<Folder />} text="Documentation" />
                <DefaultLayoutNavigationExternalLink
                    className="bg-slate-600"
                    href="/termsofservice"
                    icon={<Policy />}
                    text="Terms of Service"
                />
                <DefaultLayoutNavigationExternalLink
                    className="bg-slate-600"
                    href="/privacy"
                    icon={<RuleDataQuality />}
                    text="Privacy Policy"
                />
                <button
                    onClick={logout}
                    className={twMerge(
                        'gap-x-4',
                        'group',
                        'grid',
                        'items-center',
                        'px-3',
                        'py-2',
                        'rounded-md',
                        'grid-cols-[24px,1fr,max-content]'
                    )}
                >
                    {cloneElement(<Logout />, {
                        className: twMerge('fill-slate-400', 'h-6', 'transition-colors', 'w-6'),
                    })}
                    <div className={twMerge('transition-all', 'group-hover:font-semibold')}>{'Logout'}</div>
                </button>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
}
