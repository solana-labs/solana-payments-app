import { AcceptPolicy } from '@/AcceptModals';
import { LoadingDots } from '@/components/LoadingDots';
import * as RE from '@/lib/Result';
import { isOk } from '@/lib/Result';
import { privacyPolicySections, tosSections } from '@/lib/policies';
import { updateMerchantPrivacy, updateMerchantTos, useMerchantStore } from '@/stores/merchantStore';
import Policy from '@carbon/icons-react/lib/Policy';
import RuleDataQuality from '@carbon/icons-react/lib/RuleDataQuality';
import Store from '@carbon/icons-react/lib/Store';
import Wallet from '@carbon/icons-react/lib/Wallet';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Primary } from './Button';
import { FinishAccountSetupPromptListItem } from './FinishAccountSetupPromptListItem';
import { KYBButton } from './KYBButton';

export enum RemainingSetupItem {
    VerifyBusiness,
    AcceptTerms,
    AcceptPrivacy,
    AddWallet,
}

const STEPS = [
    RemainingSetupItem.VerifyBusiness,
    RemainingSetupItem.AddWallet,
    RemainingSetupItem.AcceptPrivacy,
    RemainingSetupItem.AcceptTerms,
] as const;

function getItemTitle(item: RemainingSetupItem) {
    switch (item) {
        case RemainingSetupItem.AcceptTerms:
            return 'Accept Terms of Service';
        case RemainingSetupItem.AcceptPrivacy:
            return 'Accept Privacy Policy';
        case RemainingSetupItem.AddWallet:
            return 'Add a wallet';
        case RemainingSetupItem.VerifyBusiness:
            return 'Verify your business';
    }
}

function getItemImage(item: RemainingSetupItem) {
    switch (item) {
        case RemainingSetupItem.AcceptTerms:
            return <Policy />;
        case RemainingSetupItem.AcceptPrivacy:
            return <RuleDataQuality />;
        case RemainingSetupItem.AddWallet:
            return <Wallet />;
        case RemainingSetupItem.VerifyBusiness:
            return <Store />;
    }
}

interface Props {
    className?: string;
    onBeginSetupItem?(setupItem: RemainingSetupItem): void;
}

export function FinishAccountSetupPrompt(props: Props) {
    const router = useRouter();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [remainingSetupItems, setRemainingSetupItems] = useState<RemainingSetupItem[]>([
        RemainingSetupItem.AcceptTerms,
        RemainingSetupItem.AcceptPrivacy,
        RemainingSetupItem.AddWallet,
        RemainingSetupItem.VerifyBusiness,
    ]);

    const kybState = RE.isOk(merchantInfo) ? merchantInfo.data.kybState : null;

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
            case RemainingSetupItem.AcceptPrivacy:
                return merchantInfo.data.acceptedPrivacyPolicy === true;
            case RemainingSetupItem.AddWallet:
                return merchantInfo.data.paymentAddress !== null;
            case RemainingSetupItem.VerifyBusiness:
                return merchantInfo.data.kybState === 'finished';
        }
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
                    <Primary onClick={getMerchantInfo}>Go to Portal</Primary>
                </Link>
            </div>
        );
    }

    return (
        <div className={twMerge('bg-slate-50', 'pt-6', 'px-4', props.className)}>
            <div className="text-black font-semibold text-lg">Finish setting up your account:</div>
            {STEPS.map((step, i) => (
                <FinishAccountSetupPromptListItem
                    additionalText={step === RemainingSetupItem.VerifyBusiness && !kybState ? '• Takes ~5m' : undefined}
                    className={twMerge('py-5', i > 0 && 'border-t border-slate-200')}
                    completed={isStepCompleted(step)}
                    icon={getItemImage(step)}
                    key={i}
                    title={getItemTitle(step)}
                    renderTrigger={
                        step === RemainingSetupItem.VerifyBusiness
                            ? () => <KYBButton />
                            : step === RemainingSetupItem.AcceptTerms
                            ? () => <AcceptPolicy title="TOS" sections={tosSections} updatePolicy={updateMerchantTos} />
                            : step === RemainingSetupItem.AcceptPrivacy
                            ? () => (
                                  <AcceptPolicy
                                      title="Privacy Policy"
                                      sections={privacyPolicySections}
                                      updatePolicy={updateMerchantPrivacy}
                                  />
                              )
                            : () => <Primary onClick={() => router.push('/getting-started/add-wallet')}>Start</Primary>
                    }
                    onStart={() => props.onBeginSetupItem?.(step)}
                />
            ))}
        </div>
    );
}
