import * as Button from '@/components/Button';
import { removeNotification } from '@/features/notification/notificationSlice';
import { resetSession } from '@/features/payment-session/paymentSessionSlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';

export const CancelledTransactionView = () => {
    const dispatch = useDispatch<AppDispatch>();

    const retryTransaction = () => {
        dispatch(resetSession());
        dispatch(removeNotification());
    };

    return (
        <div className="flex flex-col mt-8">
            <div className="text-2xl text-black mx-auto">You cancelled the transaction.</div>
            <div className="text-sm text-gray-600 mx-auto pt-2">No funds were withdrawn from your wallet.</div>
            <Button.Primary
                onClick={retryTransaction}
                className="bg-black text-white w-full shadow-lg border-2 border-black text-lg space-x-2 mt-12"
            >
                Retry the Transaction
            </Button.Primary>
        </div>
    );
};

export default CancelledTransactionView;
