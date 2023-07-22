import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

// const notificationTypeForNotification = (notification: Notification): NotificationType => {
//     switch (notification) {
//         case Notification.noPayment:
//         case Notification.noWallet:
//         case Notification.declined:
//         case Notification.duplicatePayment:
//         case Notification.insufficentFunds:
//         case Notification.simulatingIssue:
//             return NotificationType.info;
//         case Notification.transactionRequestFailed:
//             return NotificationType.error;
//         default:
//             return NotificationType.none;
//     }
// };

export enum NotificationType {
    connectWallet,
    solanaPay,
    both,
}

export enum Notification {
    none = 'Remember to drink water today.',
    noPayment = "We couldn't find a payment for you. Are you sure you're in the right place?",
    noWallet = 'There is a problem with your wallet. Disconnect and try again.',
    transactionRequestFailed = 'There was an issue building your payment transaction. Please try again.',
    transactionDoesNotExist = 'This transaction does not exist. Please try again.',
    declined = 'It looks like you declined the transaction. Was something wrong? Please try again.',
    duplicatePayment = 'It looks like you already paid. Please check your wallet.',
    insufficentFunds = "You don't have enough funds for this transaction.",
    simulatingIssue = "There's an issue with your transaction. Please try again.",
    shopifyRetry = "We're pretty sure you paid. We even told Shopify. They were all like, yo bro not so fast. We're gonna try again in a second. You'll get an email but just hand tight.",
    genericWalletError = 'There was an issue submitting your transaction with your connected wallet. Please try again.',
}

interface NotificationState {
    connectWalletNotification: Notification;
    solanaPayNotification: Notification;
}

const initalState: NotificationState = {
    connectWalletNotification: Notification.none,
    solanaPayNotification: Notification.none,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState: initalState,
    reducers: {
        setNotification: (state, action: PayloadAction<{ notification: Notification; type: NotificationType }>) => {
            switch (action.payload.type) {
                case NotificationType.connectWallet:
                    if (state.connectWalletNotification == Notification.none) {
                        state.connectWalletNotification = action.payload.notification;
                    }
                    break;
                case NotificationType.solanaPay:
                    if (state.solanaPayNotification == Notification.none) {
                        state.solanaPayNotification = action.payload.notification;
                    }
                    break;
                case NotificationType.both:
                    if (state.connectWalletNotification == Notification.none) {
                        state.connectWalletNotification = action.payload.notification;
                    }
                    if (state.solanaPayNotification == Notification.none) {
                        state.solanaPayNotification = action.payload.notification;
                    }
                    break;
            }
        },
        removeNotification: state => {
            state.solanaPayNotification = Notification.none;
            state.connectWalletNotification = Notification.none;
        },
    },
});

export const { setNotification, removeNotification } = notificationSlice.actions;

export default notificationSlice.reducer;

export const getIsSolanaPayNotification = (state: RootState): boolean =>
    state.notification.solanaPayNotification != Notification.none;
export const getIsConnectWalletNotification = (state: RootState): boolean =>
    state.notification.connectWalletNotification != Notification.none;
export const getSolanaPayNotification = (state: RootState): Notification => state.notification.solanaPayNotification;
export const getConnectWalletNotification = (state: RootState): Notification =>
    state.notification.connectWalletNotification;
export const getIsEitherNotification = (state: RootState): boolean => {
    return (
        state.notification.connectWalletNotification != Notification.none ||
        state.notification.solanaPayNotification != Notification.none
    );
};
