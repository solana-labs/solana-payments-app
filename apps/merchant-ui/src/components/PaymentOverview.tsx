import { twMerge } from 'tailwind-merge';

import { PaymentsOverviewItem } from './PaymentsOverviewItem';

interface Props {
    className?: string;
}

export function PaymentsOverview(props: Props) {
    return (
        <div className={twMerge('flex-col', 'flex', 'gap-x-6', 'gap-y-5', 'md:flex-row', props.className)}>
            <PaymentsOverviewItem className="md:w-1/3" title="Payments" value={0} />
            <PaymentsOverviewItem className="md:w-1/3" title="Total Revenue" value={0} />
            <PaymentsOverviewItem className="md:w-1/3" title="Unique Buyers" value={0} />
        </div>
    );
}
