import * as Button from '@/components/Button';
import { useMerchantStore } from '@/stores/merchantStore';
import Close from '@carbon/icons-react/lib/Close';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function AcceptPolicy({
    title,
    TextComponent,
    updatePolicy,
}: {
    title: string;
    TextComponent: () => JSX.Element;
    updatePolicy: () => Promise<Response | undefined>;
}) {
    const [open, setOpen] = useState(false);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const [pending, setPending] = useState(false);

    async function updatePolicyClick() {
        setPending(true);
        await updatePolicy();
        await getMerchantInfo();
        setPending(false);
        setOpen(false);
    }

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button.Primary pending={pending}>Accept</Button.Primary>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay
                    className={twMerge(
                        'bg-black/30',
                        'bottom-0',
                        'fixed',
                        'grid',
                        'left-0',
                        'place-items-center',
                        'right-0',
                        'top-0',
                        'z-10'
                    )}
                />
                <Dialog.Content
                    className={twMerge(
                        'bg-white',
                        'rounded-md',
                        'shadow-lg',
                        'fixed',
                        'top-1/2',
                        'left-1/2',
                        'transform',
                        '-translate-x-1/2',
                        '-translate-y-1/2',
                        'w-11/12',
                        'h-5/6',
                        'overflow-y-auto',
                        'p-6',
                        'z-20',
                        'flex',
                        'flex-col',
                        'justify-between'
                    )}
                >
                    <TextComponent />
                    <Dialog.Close>
                        <button className="absolute right-2 top-2 p-2">
                            <Close size={20} />
                        </button>
                    </Dialog.Close>
                    <Button.Primary onClick={updatePolicyClick} className="w-fit place-self-center" pending={pending}>
                        {`Accept ${title}`}
                    </Button.Primary>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
