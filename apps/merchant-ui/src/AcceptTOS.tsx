import * as Button from '@/components/Button';
import { updateMerchantTos, useMerchantStore } from '@/stores/merchantStore';
import Close from '@carbon/icons-react/lib/Close';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const WaiverText = () => {
    return (
        <div className="text-justify p-4 bg-white rounded-lg text-sm leading-6">
            <h2 className="font-bold text-3xl mb-2">Terms of Service</h2>
            <p>
                In consideration of being allowed to participate in any way in the activities and services provided by
                Solana LABS, I, the undersigned, acknowledge, appreciate, and agree that:
            </p>
            <p className="mt-4">
                I HAVE READ THIS RELEASE OF LIABILITY AND ASSUMPTION OF RISK AGREEMENT, FULLY UNDERSTAND ITS TERMS,
                UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY AGREEING TO IT ON MY OWN BEHALF OR ON BEHALF OF
                THE PARTICIPANT, AND AGREE TO IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.
            </p>
        </div>
    );
};

export default function AcceptTOS() {
    const [open, setOpen] = useState(false);

    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [pendingTos, setPendingTos] = useState(false);

    async function updateMerchantTosClick() {
        setPendingTos(true);
        await updateMerchantTos();
        await getMerchantInfo();
        setPendingTos(false);
    }

    return (
        <div className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'space-x-3')}>
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <Button.Primary pending={pendingTos}>Accept</Button.Primary>
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
                        <WaiverText />
                        <Dialog.Close>
                            <button className="absolute right-2 top-2 p-2">
                                <Close size={20} />
                            </button>
                        </Dialog.Close>
                        <Button.Primary onClick={updateMerchantTosClick} className="w-fit place-self-center">
                            Accept TOS
                        </Button.Primary>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
