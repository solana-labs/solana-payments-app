import { AppDispatch } from "@/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification, getNotification, getNotificationType, NotificationType } from "@/features/notification/notificationSlice";

const AlertNotification = ( message: string ) => {
    return (
        <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{message}</span>
        </div>
    )
}

const InfoNotification = ( message: string ) => {
    return (
        <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{message}</span>
        </div>
    )
}

const SuccessNotification = ( message: string ) => {
    return (
        <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{message}</span>
        </div>
    )
}

const WarningNotification = ( message: string ) => {
    return (
        <div className="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Warning: Invalid email address!</span>
        </div>
    )
}

const ErrorNotification = ( message: string ) => {
    return (
        <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{message}</span>
        </div>
    )
}

export const NotificationView = (): JSX.Element => {

    const dispatch = useDispatch<AppDispatch>();
    const notification = useSelector(getNotification);
    const notificationType = useSelector(getNotificationType);

    useEffect(() => {
        const interval = 3000; // 3 seconds

        const timer = setInterval(() => {
            dispatch(removeNotification());
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch]);

    switch (notificationType) {
        case NotificationType.info:
            return InfoNotification(notification);
        case NotificationType.success:
            return SuccessNotification(notification);
        case NotificationType.warning:
            return WarningNotification(notification);
        case NotificationType.error:
            return ErrorNotification(notification);
        default:
            return AlertNotification(notification);            
    }
    
}