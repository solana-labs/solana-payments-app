import {
    getConnectWalletNotification,
    getIsConnectWalletNotification,
} from '@/features/notification/notificationSlice';
import { useSelector } from 'react-redux';

const SimpleNotificationView = () => {
    const isNotification = useSelector(getIsConnectWalletNotification);
    const notification = useSelector(getConnectWalletNotification);

    return <>{isNotification ? <div className="text-red-900 text-xs font-medium">{notification}</div> : <div></div>}</>;
};

export default SimpleNotificationView;
