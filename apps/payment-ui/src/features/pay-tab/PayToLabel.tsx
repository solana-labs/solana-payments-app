import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { PaymentMethod } from './paySlice';
import { getPaymentDetails } from '@/features/payment-session/paymentSessionSlice';
import { MdArrowBack } from 'react-icons/md';
import PaymentTokenSelector from '@/components/PaymentTokenSelector';
import { convertToDollarString } from '@/utility';
import { FeePriceDisplay, FeePriceDisplayLoading } from '@/components/FeeDisplay';
import { CartAmountDisplay, CartAmountLoading } from '@/components/CartAmountDisplay';
import { PayToDisplay, PayToLoading } from '@/components/PayToDisplay';
import { PayAmountDisplay, PayAmountLoading } from '@/components/PayAmountDisplay';
import { PayAmountTokensDisplay, PayAmountTokensLoading } from '@/components/PayAmountTokensDisplay';
import { getPayingToken, getPaymentMethod, setPaymentMethod } from '../payment-options/paymentOptionsSlice';

export const PayToLabel = () => {

    const dispatch = useDispatch<AppDispatch>();
    const payingToken = useSelector(getPayingToken);
    const paymentMethod = useSelector(getPaymentMethod);
    const paymentDetails = useSelector(getPaymentDetails);

    const paymentMethodTabOption = (option: PaymentMethod, label: string) => {
        const activeTabClassName = 'tab w-1/2 tab-active color-black data-theme="cupcake"';
        const defaultTabClassName = 'tab w-1/2';

        return (
            <a
                className={paymentMethod == option ? activeTabClassName : defaultTabClassName}
                onClick={() => {
                    dispatch(setPaymentMethod(option));
                }}
            >
                {label}
            </a>
        );
    };

    return (
        <div className="">
            <div className="flex flex-col justify-between h-44">
                { paymentDetails == null ? <PayToLoading /> : <PayToDisplay merchantName={paymentDetails.merchantDisplayName} /> }
                { paymentDetails == null ? <PayAmountLoading /> : <PayAmountDisplay displayAmoumt={paymentDetails.totalAmountFiatDisplay} /> }
                <div className="flex flex-row w-full justify-between items-center">
                    { paymentDetails == null ? <PayAmountTokensLoading /> : <PayAmountTokensDisplay displayAmoumt={paymentDetails.totalAmountUSDCDisplay} /> }
                    <div className="w-2/3">
                        <PaymentTokenSelector />
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="divider" />
            </div>
            <div className="flex flex-row w-full justify-between">
                <div className="label-text">Cart</div>
                { paymentDetails == null ? <CartAmountLoading /> : <CartAmountDisplay displayAmount={paymentDetails.totalAmountFiatDisplay} /> }
            </div>
            <div className="flex flex-row w-full justify-between">
                <div className="label-text">Transaction Fee</div>
                { paymentDetails == null ? <FeePriceDisplayLoading /> : <FeePriceDisplay /> }
            </div>
        </div>
    );
};
