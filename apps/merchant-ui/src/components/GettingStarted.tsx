import { twMerge } from 'tailwind-merge';

import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { FinishAccountSetupPrompt, RemainingSetupItem } from './FinishAccountSetupPrompt';
import { isOk } from '@/lib/Result';
import { LoadingDots } from '@/components/LoadingDots';
import { useMerchantStore } from '@/stores/merchantStore';

interface Props {
    className?: string;
}

export function GettingStarted(props: Props) {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    if (!isOk(merchantInfo)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingDots />
            </div>
        );
    }

    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Welcome, {merchantInfo.data.name}!</DefaultLayoutScreenTitle>
            <div className="mt-4 text-black text-lg">Accepting payments on Solana is just three easy steps away.</div>
            <FinishAccountSetupPrompt className="mt-14 rounded-xl" />
        </DefaultLayoutContent>
    );
}
