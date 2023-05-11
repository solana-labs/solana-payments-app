import { twMerge } from 'tailwind-merge';

import { KYBButton } from './KYBButton';

interface Props {
    className?: string;
    isVerified?: boolean;
    onVerified?(): void;
}

export function MerchantInfoAccountSetup(props: Props) {
    return (
        <div className={props.className}>
            <div className="text-sm font-medium text-black">Account Setup</div>
            <div className="grid grid-cols-[1fr,max-content] items-center mt-5">
                <div>
                    <div className="text-black">Verify your business</div>
                    {!props.isVerified && <div className="text-sm text-neutral-600">Required • Takes ~5m</div>}
                </div>
                <KYBButton isVerified={props.isVerified} onVerified={props.onVerified} />
            </div>
        </div>
    );
}
