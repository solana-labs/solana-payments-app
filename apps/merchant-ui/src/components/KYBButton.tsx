import { LoadingDots } from '@/components/LoadingDots';
import * as RE from '@/lib/Result';
import { updateMerchant, useMerchantStore } from '@/stores/merchantStore';
import * as Dialog from '@radix-ui/react-dialog';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Primary } from './Button';
import { CheckmarkCircle } from './icons/CheckmarkCircle';

const Inquiry = dynamic(() => import('persona').then(m => m.Inquiry), {
    loading: () => <div />,
    ssr: false,
});

const PERSONA_HEIGHT = 800;
const PERSONA_WIDTH = 600;

interface Props {
    className?: string;
    onVerified?(): void;
}

export function KYBButton(props: Props) {
    const [open, setOpen] = useState(false);
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const kybState = RE.isOk(merchantInfo) ? merchantInfo.data.kybState : null;

    return kybState === 'finished' ? (
        <div className="flex items-center">
            <div className="text-emerald-700 text-sm font-semibold">Approved</div>
            <CheckmarkCircle className="h-5 fill-emerald-700 w-5" />
        </div>
    ) : kybState === 'pending' ? (
        <div className="flex items-center bg-indigo-100 px-4 py-2.5 rounded-lg">
            <div className="text-indigo-700 text-sm font-semibold">Pending review</div>
        </div>
    ) : kybState === 'incomplete' || kybState === 'failed' ? (
        <>
            {kybState === 'failed' && (
                <div className="flex items-center bg-red-100 px-4 py-2.5 rounded-lg">
                    <div className="text-red-700 text-sm font-semibold">Verification failed</div>
                </div>
            )}
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <Primary className={props.className}>{kybState === 'incomplete' ? 'Start' : 'Restart'}</Primary>
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
                    >
                        <Dialog.Content
                            className="bg-white rounded-xl overflow-hidden"
                            style={{ width: PERSONA_WIDTH, height: PERSONA_HEIGHT }}
                        >
                            <Inquiry
                                templateId="itmpl_r9DWaWkBDNJb2KTd1c83i5Xg"
                                referenceId={RE.isOk(merchantInfo) ? merchantInfo.data.shop : ''}
                                environmentId={process.env.NEXT_PUBLIC_PERSONA_ENVIRONMENT_ID}
                                frameWidth={PERSONA_WIDTH}
                                frameHeight={PERSONA_HEIGHT}
                                onComplete={async ({ inquiryId, status, fields }) => {
                                    await updateMerchant('kybInquiry', inquiryId);
                                    await getMerchantInfo();
                                    props.onVerified?.();
                                    setOpen(false);
                                }}
                            />
                        </Dialog.Content>
                    </Dialog.Overlay>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    ) : (
        <LoadingDots />
    );
}
