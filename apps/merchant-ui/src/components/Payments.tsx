import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { PaymentsHistory } from './PaymentsHistory';

interface Props {
    className?: string;
}

export function Payments(props: Props) {
    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle className="hidden md:block">Payments</DefaultLayoutScreenTitle>
            <DefaultLayoutScreenTitle className="block mt-8 md:hidden">Payments</DefaultLayoutScreenTitle>
            <PaymentsHistory className="mt-9" />
        </DefaultLayoutContent>
    );
}
