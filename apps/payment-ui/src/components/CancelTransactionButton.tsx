import { MergedState, getMergedState, resetSession } from '@/features/payment-session/paymentSessionSlice';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';


const CancelTransactionButton = () => {

    const dispatch = useDispatch<AppDispatch>();
    const mergedState = useSelector(getMergedState)

    const cancelTransaction = () => {
        dispatch(resetSession())
    }

    const isDisabled = () => {
        if ( mergedState >= MergedState.processing ) {
            return true
        } else {
            return false
        }
    }

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-6">
                <button className='btn w-full outline-none disabled:bg-gray-200 disabled:text-gray-400 border-2 border-black hover:bg-white bg-white text-black flex justify-center items-center normal-case' onClick={cancelTransaction}>
                    <div className='flex flex-row items-center justify-center'>
                        <div className='pl-1'>Cancel transaction</div>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default CancelTransactionButton;