import { AppDispatch } from "@/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getConnectWalletNotification, getIsConnectWalletNotification } from "@/features/notification/notificationSlice";

const SimpleNotificationView = () => {

    const isNotification = useSelector(getIsConnectWalletNotification)
    const notification = useSelector(getConnectWalletNotification)

    return (
        <>
            { 
                isNotification ? 
                    (
                        <div className="text-red-900 text-xs font-medium">{notification}</div>
                    )  
                :   (
                        <div></div>
                    )
            }
        </>
    )
    
}

export default SimpleNotificationView