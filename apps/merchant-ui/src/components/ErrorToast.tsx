import * as Toast from '@radix-ui/react-toast';
import { useEffect, useState } from 'react';

interface Props {
    errorMessage: string | null;
}

export default function ErrorToast(props: Props) {
    const [open, setOpen] = useState(false);

    // This effect runs whenever errorMessage changes.
    useEffect(() => {
        if (props.errorMessage) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [props.errorMessage]);

    return (
        <Toast.Provider swipeDirection="right">
            <Toast.Root
                className="bg-white rounded-md shadow-lg p-3 grid items-center gap-3"
                open={open}
                onOpenChange={setOpen}
            >
                <Toast.Title className="font-medium text-gray-800 text-sm">Error</Toast.Title>
                <Toast.Description className="text-gray-700 text-xs">{props.errorMessage}</Toast.Description>
            </Toast.Root>
            <Toast.Viewport />
        </Toast.Provider>
    );
}
