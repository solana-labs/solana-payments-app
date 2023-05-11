import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';

import { FinishAccountSetupPromptListItem } from './FinishAccountSetupPromptListItem';
import { KYBButton } from './KYBButton';
import { Primary } from './Button';

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
    remainingSetupItems: RemainingSetupItem[];
    onBeginSetupItem?(setupItem: RemainingSetupItem): void;
}

export function FinishAccountSetupPrompt(props: Props) {
    const router = useRouter();

    if (!props.remainingSetupItems.length) {
        return (
            <div className={twMerge('bg-slate-50', 'py-5', 'px-4', 'text-center', props.className)}>
                <div className="font-semibold text-black">🎉 Congrats, Solana Pay is now live!</div>
                <div className="text-black">Your store now accepts Solana and USDC payments.</div>
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
                    completed={!props.remainingSetupItems.includes(step)}
                    img=""
                    key={i}
                    title={getItemTitle(step)}
                    renderTrigger={
                        step === RemainingSetupItem.VerifyBusiness
                            ? () => <KYBButton />
                            : step === RemainingSetupItem.AcceptTerms
                            ? () => <Primary>Accept</Primary>
                            : () => <Primary onClick={() => router.push('/getting-started/add-wallet')}>Start</Primary>
                    }
                    onStart={() => props.onBeginSetupItem?.(step)}
                />
            ))}
        </div>
    );
}
