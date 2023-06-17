import { resetSession } from '@/features/payment-session/paymentSessionSlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';


const CancelTransactionButton = () => {

    const dispatch = useDispatch<AppDispatch>();

    const cancelTransaction = () => {
        dispatch(resetSession())
    }

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-6">
                <button className='btn w-full outline outline-1.5 hover:bg-white bg-white text-black flex justify-center items-center normal-case' onClick={cancelTransaction}>
                    <div className='flex flex-row items-center justify-center'>
                        <div className='pl-1'>Cancel transaction</div>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default CancelTransactionButton;