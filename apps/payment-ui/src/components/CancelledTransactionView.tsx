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
            <div className="flex flex-col items-center">
                <button
                    className="btn btn-md w-4/5 outline-none border-2 border-black hover:bg-white bg-white text-black flex justify-center items-center normal-case mt-12"
                    onClick={retryTransaction}
                >
                    <div className="pl-1">Retry the transaction</div>
                </button>
            </div>
        </div>
    );
};

export default CancelledTransactionView;
