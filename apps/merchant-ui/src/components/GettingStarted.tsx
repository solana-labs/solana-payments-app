import { twMerge } from 'tailwind-merge';

import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { FinishAccountSetupPrompt, RemainingSetupItem } from './FinishAccountSetupPrompt';
import { useMerchant } from '@/hooks/useMerchant';
import { isOk } from '@/lib/Result';

interface Props {
    className?: string;
}

export function GettingStarted(props: Props) {
    const merchantInfo = useMerchant();
    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>
                Welcome, {isOk(merchantInfo) ? merchantInfo.data.name : '[shopify id]'}!
            </DefaultLayoutScreenTitle>
            <div className="mt-4 text-black text-lg">Accepting payments on Solana is just three easy steps away.</div>
            <FinishAccountSetupPrompt
                className="mt-14 rounded-xl"
                remainingSetupItems={[
                    RemainingSetupItem.VerifyBusiness,
                    RemainingSetupItem.AddWallet,
                    RemainingSetupItem.AcceptTerms,
                ]}
            />
        </DefaultLayoutContent>
    );
}
