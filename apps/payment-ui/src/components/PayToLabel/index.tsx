import { getCustomer, getNextTier, getTier } from '@/features/customer/customerSlice';
import {
    getLoyaltyDetails,
    getPaymentDetails,
    getProductDetails,
} from '@/features/payment-details/paymentDetailsSlice';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { CartAmountDisplay, CartAmountLoading } from './CartAmountDisplay';
import { DiscountAmountDisplay, DiscountAmountLoading } from './DiscountAmountDisplay';
import { FeePriceDisplay, FeePriceDisplayLoading } from './FeeDisplay';
import { PayAmountLoading } from './PayAmountDisplay';
import { PayAmountTokensDisplay } from './PayAmountTokensDisplay';
import { PayToDisplay, PayToLoading } from './PayToDisplay';
import { TierUpgradeNotification } from './TierUpgradeNotification';

export const PayToLabel = () => {
    const paymentDetails = useSelector(getPaymentDetails);
    const customerTier = useSelector(getTier);
    const customerNextTier = useSelector(getNextTier);
    const productDetails = useSelector(getProductDetails);
    const loyaltyDetails = useSelector(getLoyaltyDetails);
    const customer = useSelector(getCustomer);

    const [discount, setDiscount] = useState<number>(0);
    const [cart, setCart] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (paymentDetails) {
            let cartValue = Number(paymentDetails.usdcSize);

            setCart(cartValue);
            if (customerTier && cartValue > 0) {
                setDiscount((cartValue * customerTier.discount) / 100);
            }
            setIsLoading(false);
        }
    }, [paymentDetails, customerTier]);

    function calculateFinalAmount(): number {
        if (!paymentDetails) {
            return -1;
        }
        if (!loyaltyDetails || !customer || !customerTier) {
            return paymentDetails.usdcSize;
        }

        if (loyaltyDetails?.loyaltyProgram === 'tiers' && customer.customerOwns) {
            return cart - discount;
        } else {
            return paymentDetails.usdcSize;
        }
    }

    const hasProductDetails = productDetails.length > 0;
    const showTierDiscount =
        loyaltyDetails?.loyaltyProgram === 'tiers' && customerTier && discount > 0 && customer.customerOwns;
    const showTierUpgrade =
        loyaltyDetails?.loyaltyProgram === 'tiers' && customerNextTier && customerNextTier.discount > 0;

    if (isLoading || !paymentDetails) {
        return (
            <div>
                <div className="flex flex-col justify-between space-y-5">
                    <PayToLoading />
                    <PayAmountLoading />
                </div>
                <div className="flex flex-col w-full mt-2">
                    <div className="divider" />
                </div>
                <CartAmountLoading />
                {showTierDiscount && <DiscountAmountLoading />}
                <FeePriceDisplayLoading />
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col justify-between space-y-5">
                <PayToDisplay merchantName={paymentDetails.merchantDisplayName} />
                <PayAmountTokensDisplay amount={calculateFinalAmount()} />
                {loyaltyDetails?.points.pointsBack && (
                    <div className="flex flex-row space-x-1">
                        <p className="">Points Back</p>
                        <p className="">
                            {((paymentDetails.usdcSize * loyaltyDetails?.points.pointsBack) / 100).toFixed(2)}
                        </p>
                    </div>
                )}

                {hasProductDetails && (
                    <div>
                        <p className="">NFT Rewards</p>
                        <div className="flex flex-row ">
                            {productDetails.map(
                                product =>
                                    product.image &&
                                    product.name && (
                                        <Image
                                            key={product.id}
                                            src={product.image}
                                            alt={product.name}
                                            width={50}
                                            height={50}
                                        />
                                    )
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col w-full mt-2">
                <div className="divider" />
            </div>
            <CartAmountDisplay amount={cart} />
            {showTierDiscount && (
                <DiscountAmountDisplay
                    amount={discount}
                    tierName={customerTier.name}
                    percentage={customerTier.discount}
                />
            )}
            <FeePriceDisplay />
            {showTierUpgrade && (
                <TierUpgradeNotification
                    nextTierName={customerNextTier.name}
                    nextTierDiscount={customerNextTier.discount}
                />
            )}
        </div>
    );
};
