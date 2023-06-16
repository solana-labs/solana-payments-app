import { AppDispatch } from "@/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification, getNotification, getNotificationType, NotificationType, getIsNotification } from "@/features/notification/notificationSlice";

const SimpleNotificationView = () => {

    const isNotification = useSelector(getIsNotification)
    const notification = useSelector(getNotification)

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