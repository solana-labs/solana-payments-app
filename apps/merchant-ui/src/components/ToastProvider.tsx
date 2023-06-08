import * as Toast from '@radix-ui/react-toast';
import { FC, createContext, useContext, useState } from 'react';

type ShowFunction = (message: string) => void;

const ToastContext = createContext<ShowFunction | undefined>(undefined);

export function useToast() {
    return useContext(ToastContext);
}

interface ToastProviderProps {
    children: React.ReactNode;
}

export const CustomToastProvider: FC<ToastProviderProps> = ({ children }) => {
    const [toast, setToast] = useState({ open: false, message: '' });

    const show: ShowFunction = message => {
        setToast({ open: true, message });
    };

    const close = () => {
        console.log('about to close');
        setToast({ open: false, message: '' });
    };

    return (
        <ToastContext.Provider value={show}>
            <Toast.Provider swipeDirection="right">
                <Toast.Root
                    className="relative border border-red-500 bg-red-100 text-red-700 rounded-md shadow-lg p-3"
                    open={toast.open}
                    onOpenChange={close}
                    duration={2501}
                >
                    <div>
                        <Toast.Title className="font-medium text-red-700 text-sm">Error</Toast.Title>
                        <Toast.Description className="text-red-600 text-xs">{toast.message}</Toast.Description>
                    </div>
                </Toast.Root>

                <Toast.Viewport className="fixed bottom-0 left-1/2 transform translate-x-[-50%] z-100 pb-10" />
            </Toast.Provider>
            {children}
        </ToastContext.Provider>
    );
};
