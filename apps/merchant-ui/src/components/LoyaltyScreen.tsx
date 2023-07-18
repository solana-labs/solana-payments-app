import * as Button from '@/components/Button';

import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';

interface Props {
    className?: string;
}

export function LoyaltyScreen(props: Props) {
    async function setupLoyaltyProgram() {}

    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle className="hidden md:block">Loyalty Program</DefaultLayoutScreenTitle>
            <DefaultLayoutScreenTitle className="block mt-8 md:hidden">Loyalty Program</DefaultLayoutScreenTitle>
            <Button.Primary onClick={setupLoyaltyProgram}></Button.Primary>
        </DefaultLayoutContent>
    );
}
