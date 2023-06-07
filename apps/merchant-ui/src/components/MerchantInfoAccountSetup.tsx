import * as RE from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import { KYBButton } from './KYBButton';

interface Props {
    className?: string;
    onVerified?(): void;
}

export function MerchantInfoAccountSetup(props: Props) {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const kybState = RE.isOk(merchantInfo) ? merchantInfo.data.kybState : null;

    return (
        <div className={props.className}>
            <div className="text-sm font-medium text-black">Account Setup</div>
            <div className="grid grid-cols-[1fr,max-content] items-center mt-5">
                <div>
                    <div className="text-black">Verify your business</div>
                    {!kybState && <div className="text-sm text-neutral-600">Required • Takes ~5m</div>}
                </div>
                <KYBButton onVerified={props.onVerified} />
            </div>
        </div>
    );
}
