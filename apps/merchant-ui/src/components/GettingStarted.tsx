import { twMerge } from 'tailwind-merge';

import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { FinishAccountSetupPrompt, RemainingSetupItem } from './FinishAccountSetupPrompt';

interface Props {
    className?: string;
    merchantName: string;
}

export function GettingStarted(props: Props) {
    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Welcome, {props.merchantName}!</DefaultLayoutScreenTitle>
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
