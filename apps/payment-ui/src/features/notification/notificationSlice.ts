import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const notificationTypeForNotification = (notification: Notification): NotificationType => {
    switch (notification) {
        case Notification.noPayment:
        case Notification.noWallet:
        case Notification.declined:
        case Notification.duplicatePayment:
        case Notification.insufficentFunds:
            return NotificationType.info;
        case Notification.transactionRequestFailed:
            return NotificationType.error;
        default:
            return NotificationType.none;
    }
};

export enum NotificationType {
    none,
    info,
    success,
    warning,
    error,
}

export enum Notification {
    none = 'Remember to drink water today.',
    noPayment = "We couldn't find a payment for you. Are you sure you're in the right place?",
    noWallet = "We don' see your wallet connected. Please connect your wallet to continue.",
    transactionRequestFailed = 'There was an issue building your payment transaction. Please try again.',
    declined = 'It looks like you declined the transaction. Was something wrong? Please try again.',
    duplicatePayment = 'It looks like you already paid. Please check your wallet.',
    insufficentFunds = "It looks like you don't have enough USDC in your wallet. Please add more and try again.",
    simulatingIssue = "There's an issue with your transaction. Please try again.",
}

interface NotificationState {
    notification: Notification;
}

const initalState: NotificationState = {
    notification: Notification.none,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState: initalState,
    reducers: {
        setNotification: (state, action: PayloadAction<Notification>) => {
            state.notification = action.payload;
        },
        removeNotification: state => {
            state.notification = Notification.none;
        },
    },
});

export const { setNotification, removeNotification } = notificationSlice.actions;

export default notificationSlice.reducer;

export const getIsNotification = (state: RootState): boolean => state.notification.notification !== Notification.none;
export const getNotification = (state: RootState): Notification => state.notification.notification;
export const getNotificationType = (state: RootState): NotificationType =>
    notificationTypeForNotification(state.notification.notification);
