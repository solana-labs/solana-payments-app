import {
    getIsSolanaPayNotification,
    getSolanaPayNotification,
    removeNotification,
} from '@/features/notification/notificationSlice';
import { AppDispatch } from '@/store';
import { FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';

const SolanaPayErrorView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const notification = useSelector(getSolanaPayNotification);
    const isNotification = useSelector(getIsSolanaPayNotification);

    const cancelNotification = () => {
        dispatch(removeNotification());
    };

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-6">
                {isNotification && notification ? (
                    <button
                        className="btn w-full outline-none border-2 border-red-900 hover:bg-red-100 hover:border-red-900 bg-red-100 text-red-900 font-normal flex justify-start items-center normal-case"
                        onClick={cancelNotification}
                    >
                        <div className="flex flex-row items-center justify-between w-full">
                            <div className="">{notification.valueOf()}</div>
                            <FiX className="text-xl" />
                        </div>
                    </button>
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    );
};

export default SolanaPayErrorView;
