import { CartAmountDisplay, CartAmountLoading } from '@/components/CartAmountDisplay';
import { FeePriceDisplay, FeePriceDisplayLoading } from '@/components/FeeDisplay';
import { PayAmountDisplay, PayAmountLoading } from '@/components/PayAmountDisplay';
import { PayAmountTokensDisplay, PayAmountTokensLoading } from '@/components/PayAmountTokensDisplay';
import { PayToDisplay, PayToLoading } from '@/components/PayToDisplay';
import PaymentTokenSelector from '@/components/PaymentTokenSelector';
import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import { BiInfoCircle } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import {
    PaymentMethod,
    getPayingToken,
    getPaymentMethod,
    setPaymentMethod,
} from '../features/payment-options/paymentOptionsSlice';
import { AppDispatch } from '../store';

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
                {paymentDetails == null ? (
                    <PayToLoading />
                ) : (
                    <PayToDisplay merchantName={paymentDetails.merchantDisplayName} />
                )}
                {paymentDetails == null ? (
                    <PayAmountLoading />
                ) : (
                    <PayAmountDisplay displayAmoumt={paymentDetails.totalAmountFiatDisplay} />
                )}
                <div className="flex flex-row w-full justify-between items-center">
                    {paymentDetails == null ? (
                        <PayAmountTokensLoading />
                    ) : (
                        <PayAmountTokensDisplay displayAmoumt={`${paymentDetails.usdcSize.toFixed(2)} USDC`} />
                    )}
                    <div className="w-2/3">
                        <PaymentTokenSelector />
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="divider" />
            </div>
            <div className="flex flex-row w-full items-center justify-between">
                <div className="label-text text-gray-600">Cart</div>
                {paymentDetails == null ? (
                    <CartAmountLoading />
                ) : (
                    <CartAmountDisplay displayAmount={paymentDetails.totalAmountFiatDisplay} />
                )}
            </div>
            <div className="flex flex-row w-full items-center justify-between">
                <label tabIndex={0} htmlFor="fee-detail-modal">
                    <div className="flex flex-row justify-center items-center">
                        <div className="label-text text-gray-600">Transaction Fee</div>
                        <BiInfoCircle className="text-sm ml-2 label-text text-gray-600" />
                    </div>
                </label>
                <input type="checkbox" id="fee-detail-modal" className="modal-toggle" />
                <div id="fee-detail-modal" className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box bg-white">
                        <div className="flex flex-col h-full items-start justify-center">
                            <div className="modal-action">
                                <label
                                    htmlFor="fee-detail-modal"
                                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-900 bg-gray-200"
                                >
                                    ✕
                                </label>
                            </div>
                            <div className="text-xl font-semibold mb-2">Transaction Fee</div>
                            <div className="text-gray-600">
                                Solana Pay covers the transaction fee so that all you need is USDC to complete your
                                transaction. Your wallet may still show this as part of your transaction.
                            </div>
                        </div>
                    </div>
                    <label className="modal-backdrop" htmlFor="fee-detail-modal">
                        Close
                    </label>
                </div>
                {paymentDetails == null ? <FeePriceDisplayLoading /> : <FeePriceDisplay />}
            </div>
        </div>
    );
};
