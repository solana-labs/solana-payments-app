import { CartAmountDisplay, CartAmountLoading } from '@/components/PayToLabel/CartAmountDisplay';
import { FeePriceDisplay, FeePriceDisplayLoading } from '@/components/PayToLabel/FeeDisplay';
import { PayAmountDisplay, PayAmountLoading } from '@/components/PayToLabel/PayAmountDisplay';
import { PayAmountTokensDisplay, PayAmountTokensLoading } from '@/components/PayToLabel/PayAmountTokensDisplay';
import { PayToDisplay, PayToLoading } from '@/components/PayToLabel/PayToDisplay';
import { getNextTier, getTier } from '@/features/customer/customerSlice';
import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import { useSelector } from 'react-redux';
import { DiscountAmountDisplay, DiscountAmountLoading } from './DiscountAmountDisplay';
import { TierUpgradeNotification } from './TierUpgradeNotification';

export const PayToLabel = () => {
    const paymentDetails = useSelector(getPaymentDetails);
    const customerTier = useSelector(getTier);
    const customerNextTier = useSelector(getNextTier);

    console.log('label tier', customerTier);
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
                <DiscountAmountLoading />
                <FeePriceDisplayLoading />
            </div>
        );
    }

    let cart = Number(paymentDetails.totalAmountFiatDisplay.substring(1));
    let final = cart;
    let discount;

    if (customerTier != null) {
        discount = (customerTier.discount * cart) / 100;
        final = cart - discount;
    }

    return (
        <div>
            <div className="flex flex-col justify-between h-44">
                <PayToDisplay merchantName={paymentDetails.merchantDisplayName} />
                <PayAmountDisplay amount={final} />
                <PayAmountTokensDisplay amount={paymentDetails.usdcSize} />
            </div>
            <div className="flex flex-col w-full">
                <div className="divider" />
            </div>
            <CartAmountDisplay amount={cart} />
            <FeePriceDisplay />
            {customerTier && discount && (
                <DiscountAmountDisplay
                    amount={discount}
                    tierName={customerTier.name}
                    percentage={customerTier.discount}
                />
            )}
            {customerNextTier && customerNextTier.discount && (
                <TierUpgradeNotification
                    nextTierName={customerNextTier.name}
                    nextTierDiscount={customerNextTier.discount}
                />
            )}
        </div>
    );
};
