import * as Button from '@/components/Button';
import { MergedState, getMergedState, resetSession } from '@/features/payment-session/paymentSessionSlice';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

const CancelTransactionButton = () => {
    const dispatch = useDispatch<AppDispatch>();
    const mergedState = useSelector(getMergedState);

    const cancelTransaction = () => {
        dispatch(resetSession());
    };

    const isDisabled = () => {
        if (mergedState >= MergedState.processing) {
            return true;
        } else {
            return false;
        }
    };

    return (
        <div className="flex flex-col justify-end h-full">
            <Button.Secondary
                onClick={cancelTransaction}
                disabled={isDisabled()}
                className="bg-black text-white w-full shadow-lg border-2 border-black text-lg space-x-2 mt-12 mb-6"
            >
                Cancel Transaction
            </Button.Secondary>
        </div>
    );
};

export default CancelTransactionButton;
