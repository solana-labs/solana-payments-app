import { LoadingDots } from '@/components/LoadingDots';
import { isOk } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { FinishAccountSetupPrompt } from './FinishAccountSetupPrompt';

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
