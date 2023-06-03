import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';

import { FinishAccountSetupPromptListItem } from './FinishAccountSetupPromptListItem';
import { KYBButton } from './KYBButton';
import { Primary } from './Button';
import { updateMerchantTos, useMerchant } from '@/hooks/useMerchant';
import { isOk } from '@/lib/Result';
import { LoadingDots } from '@/components/LoadingDots';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export enum RemainingSetupItem {
    VerifyBusiness,
    AcceptTerms,
    AddWallet,
}

const STEPS = [
    RemainingSetupItem.VerifyBusiness,
    RemainingSetupItem.AddWallet,
    RemainingSetupItem.AcceptTerms,
] as const;

function getItemTitle(item: RemainingSetupItem) {
    switch (item) {
        case RemainingSetupItem.AcceptTerms:
            return 'Accept Terms of Service and Privacy Policy';
        case RemainingSetupItem.AddWallet:
            return 'Add a wallet';
        case RemainingSetupItem.VerifyBusiness:
            return 'Verify your business';
    }
}

interface Props {
    className?: string;
    onBeginSetupItem?(setupItem: RemainingSetupItem): void;
}

export function FinishAccountSetupPrompt(props: Props) {
    const router = useRouter();

    const { merchantInfo, getMerchantInfo } = useMerchant();

    const [pendingTos, setPendingTos] = useState(false);

    const [remainingSetupItems, setRemainingSetupItems] = useState<RemainingSetupItem[]>([
        RemainingSetupItem.AcceptTerms,
        RemainingSetupItem.AddWallet,
        RemainingSetupItem.VerifyBusiness,
    ]);

    useEffect(() => {
        if (!isOk(merchantInfo)) {
            return;
        }
        let items = STEPS.filter(item => !isStepCompleted(item));
        setRemainingSetupItems(items);
    }, [merchantInfo]);

    function isStepCompleted(step: RemainingSetupItem) {
        if (!isOk(merchantInfo)) {
            return false;
        }

        switch (step) {
            case RemainingSetupItem.AcceptTerms:
                return merchantInfo.data.acceptedTermsAndConditions === true;
            case RemainingSetupItem.AddWallet:
                return merchantInfo.data.paymentAddress !== null;
            case RemainingSetupItem.VerifyBusiness:
                return true;
        }
    }

    async function updateMerchantTosClick() {
        setPendingTos(true);
        await updateMerchantTos();
        await getMerchantInfo();
        setPendingTos(false);
    }

    if (!isOk(merchantInfo)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingDots />
            </div>
        );
    }

    if (remainingSetupItems.length === 0) {
        return (
            <div
                className={twMerge(
                    'bg-slate-50',
                    'py-5',
                    'px-4',
                    'text-center',
                    'flex',
                    'space-y-2',
                    'flex-col',
                    'items-center',
                    props.className
                )}
            >
                <div className="font-semibold text-black">🎉 Congrats, Solana Pay is now live!</div>
                <div className="text-black">Your store now accepts Solana and USDC payments.</div>
                <Link href="/payments">
                    <Primary>Go to Portal</Primary>
                </Link>
            </div>
        );
    }

    return (
        <div className={twMerge('bg-slate-50', 'pt-6', 'px-4', props.className)}>
            <div className="text-black font-semibold text-lg">Finish setting up your account:</div>
            {STEPS.map((step, i) => (
                <FinishAccountSetupPromptListItem
                    additionalText={step === RemainingSetupItem.VerifyBusiness ? '• Takes ~5m' : undefined}
                    className={twMerge('py-5', i > 0 && 'border-t border-slate-200')}
                    completed={isStepCompleted(step)}
                    img=""
                    key={i}
                    title={getItemTitle(step)}
                    renderTrigger={
                        step === RemainingSetupItem.VerifyBusiness
                            ? () => <div />
                            : step === RemainingSetupItem.AcceptTerms
                            ? () => (
                                  <Primary onClick={updateMerchantTosClick} pending={pendingTos}>
                                      Accept
                                  </Primary>
                              )
                            : () => <Primary onClick={() => router.push('/getting-started/add-wallet')}>Start</Primary>
                    }
                    onStart={() => props.onBeginSetupItem?.(step)}
                />
            ))}
        </div>
    );
}
