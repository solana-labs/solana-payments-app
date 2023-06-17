import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { FiX } from 'react-icons/fi';
import { getIsSolanaPayNotification, getSolanaPayNotification, removeNotification } from '@/features/notification/notificationSlice';
import { resetSession } from '@/features/payment-session/paymentSessionSlice';

const SolanaPayErrorView = () => {

    const dispatch = useDispatch<AppDispatch>();
    const notification = useSelector(getSolanaPayNotification)
    const isNotification = useSelector(getIsSolanaPayNotification)


    const cancelNotification = () => {
        dispatch(removeNotification())
    }

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-6">
                {
                    isNotification && notification ? (
                        <button className='btn w-full outline hover:bg-red-100 outline-1.5 outline-red-900 border-none bg-red-100 text-red-900 font-normal flex justify-start items-center normal-case' onClick={cancelNotification}>
                            <div className='flex flex-row items-center justify-between w-full'>
                                <div className=''>{notification.valueOf()}</div>
                                <FiX className='text-xl'/>
                            </div>
                        </button>
                    )
                    :
                    (
                        <div></div>
                    )
                }
                
            </div>
        </div>
    )
}

export default SolanaPayErrorView;