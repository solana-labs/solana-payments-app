import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getPayingToken, getPaymentDetails, getPaymentMethod, PaymentMethod, setPaymentMethod } from './paySlice';
import { MdArrowBack } from 'react-icons/md';
import PaymentTokenSelector from '@/components/PaymentTokenSelector';
import { convertToDollarString } from '@/utility';
import { FeeDisplay, FeeDisplayLoading } from '@/components/fee-display/FeeDisplay';
import { CartAmountDisplay, CartAmountLoading } from '@/components/CartAmountDisplay';
import { PayToDisplay, PayToLoading } from '@/components/PayToDisplay';
import { PayAmountDisplay, PayAmountLoading } from '@/components/PayAmountDisplay';
import { PayAmountTokensDisplay, PayAmountTokensLoading } from '@/components/PayAmountTokensDisplay';

export const PayToLabel = () => {

    const loading = true
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
                { loading ? <PayToLoading /> : <PayToDisplay merchantName={paymentDetails.merchantDisplayName} /> }
                { loading ? <PayAmountLoading /> : <PayAmountDisplay displayAmoumt={paymentDetails.totalAmountFiatDisplay} /> }
                <div className="flex flex-row w-full justify-between items-center">
                    { loading ? <PayAmountTokensLoading /> : <PayAmountTokensDisplay displayAmoumt={paymentDetails.totalAmountUSDCDisplay} /> }
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
                { loading ? <CartAmountLoading /> : <CartAmountDisplay displayAmount={paymentDetails.totalAmountFiatDisplay} /> }
            </div>
            <div className="flex flex-row w-full justify-between">
                <div className="label-text">Transaction Fee</div>
                { loading ? <FeeDisplayLoading /> : <FeeDisplay /> }
            </div>
        </div>
    );
};
