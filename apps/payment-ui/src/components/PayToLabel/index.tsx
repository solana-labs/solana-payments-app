import { CartAmountDisplay, CartAmountLoading } from '@/components/PayToLabel/CartAmountDisplay';
import { FeePriceDisplay, FeePriceDisplayLoading } from '@/components/PayToLabel/FeeDisplay';
import { PayAmountLoading } from '@/components/PayToLabel/PayAmountDisplay';
import { PayAmountTokensDisplay, PayAmountTokensLoading } from '@/components/PayToLabel/PayAmountTokensDisplay';
import { PayToDisplay, PayToLoading } from '@/components/PayToLabel/PayToDisplay';
import { getNextTier, getTier } from '@/features/customer/customerSlice';
import { getPaymentDetails, getProductDetails } from '@/features/payment-details/paymentDetailsSlice';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { DiscountAmountDisplay, DiscountAmountLoading } from './DiscountAmountDisplay';
import { TierUpgradeNotification } from './TierUpgradeNotification';

export const PayToLabel = () => {
    const paymentDetails = useSelector(getPaymentDetails);
    const customerTier = useSelector(getTier);
    const customerNextTier = useSelector(getNextTier);
    const productDetails = useSelector(getProductDetails);

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
    let discount = 0;

    if (customerTier != null) {
        discount = (customerTier.discount * cart) / 100;
        final = cart - discount;
    }

    return (
        <div>
            <div className="flex flex-col justify-between space-y-5">
                <PayToDisplay merchantName={paymentDetails.merchantDisplayName} />
                <PayAmountTokensDisplay amount={final} />
                {productDetails.length > 0 && (
                    <div>
                        <p className="">NFT Rewards</p>
                        <div className="flex flex-row ">
                            {productDetails.map(product => (
                                <Image key={product.id} src={product.image} alt={product.name} width={50} height={50} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full mt-2">
                <div className="divider" />
            </div>
            <CartAmountDisplay amount={cart} />
            <FeePriceDisplay />
            {customerTier && discount > 0 && (
                <DiscountAmountDisplay
                    amount={discount}
                    tierName={customerTier.name}
                    percentage={customerTier.discount}
                />
            )}
            {customerNextTier && customerNextTier.discount > 0 && (
                <TierUpgradeNotification
                    nextTierName={customerNextTier.name}
                    nextTierDiscount={customerNextTier.discount}
                />
            )}
        </div>
    );
};
