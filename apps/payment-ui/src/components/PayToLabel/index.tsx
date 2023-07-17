import { CartAmountDisplay, CartAmountLoading } from '@/components/PayToLabel/CartAmountDisplay';
import { FeePriceDisplay, FeePriceDisplayLoading } from '@/components/PayToLabel/FeeDisplay';
import { PayAmountDisplay, PayAmountLoading } from '@/components/PayToLabel/PayAmountDisplay';
import { PayAmountTokensDisplay, PayAmountTokensLoading } from '@/components/PayToLabel/PayAmountTokensDisplay';
import { PayToDisplay, PayToLoading } from '@/components/PayToLabel/PayToDisplay';
import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import { useSelector } from 'react-redux';

export const PayToLabel = () => {
    const paymentDetails = useSelector(getPaymentDetails);

    if (paymentDetails === null) {
        return (
            <div>
                <div className="flex flex-col justify-between h-44">
                    <PayToLoading />
                    <PayAmountLoading />
                    <PayAmountTokensLoading />
                </div>
                <div className="flex flex-col w-full">
                    <div className="divider" />
                </div>
                <CartAmountLoading />
                <FeePriceDisplayLoading />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between h-44">
                <PayToDisplay merchantName={paymentDetails.merchantDisplayName} />
                <PayAmountDisplay displayAmoumt={paymentDetails.totalAmountFiatDisplay} />
                <PayAmountTokensDisplay displayAmoumt={`${paymentDetails.usdcSize.toFixed(2)} USDC`} />
            </div>
            <div className="flex flex-col w-full">
                <div className="divider" />
            </div>
            <CartAmountDisplay displayAmount={paymentDetails.totalAmountFiatDisplay} />
            <FeePriceDisplay />
        </div>
    );
};
