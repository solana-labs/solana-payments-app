import * as Button from '@/components/Button';
import { updateMerchantTos, useMerchantStore } from '@/stores/merchantStore';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const WaiverText = () => {
    return (
        <div className="text-justify p-4 bg-white rounded-lg text-sm leading-6">
            <h2 className="font-bold text-lg mb-2">Terms of Service</h2>
            <p>
                In consideration of being allowed to participate in any way in the activities and services provided by
                Solana LABS, I, the undersigned, acknowledge, appreciate, and agree that:
            </p>
            {/* <ol className="list-decimal list-inside mt-2">
                <li>
                    The risk of injury from the activities involved in this program is significant, and while particular
                    rules, equipment, and personal discipline may reduce this risk, the risk of serious injury does
                    exist.
                </li>
                <li>
                    I knowingly and freely assume all such risks, both known and unknown, even if arising from the
                    negligence of the releases or others, and assume full responsibility for my participation.
                </li>
                <li>
                    I willingly agree to comply with the stated and customary terms and conditions for participation.
                    If, however, I observe any unusual significant hazard during my presence or participation, I will
                    remove myself from participation and bring such to the attention of the nearest official
                    immediately.
                </li>
                <li>
                    I, for myself and on behalf of my heirs, assigns, personal representatives and next of kin, hereby
                    release and hold harmless [Your Company Name], their officers, officials, agents, and/or employees,
                    other participants, sponsoring agencies, sponsors, advertisers, and if applicable, owners and
                    lessors of premises used to conduct the event, with respect to any and all injury, disability,
                    death, or loss or damage to person or property, whether arising from the negligence of the releases
                    or otherwise, to the fullest extent permitted by law.
                </li>
            </ol> */}
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
                        // className="bg-black bg-opacity-50 fixed inset-0"
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
                        <Button.Primary onClick={updateMerchantTosClick} className="w-fit place-self-end">
                            Accept TOS
                        </Button.Primary>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
