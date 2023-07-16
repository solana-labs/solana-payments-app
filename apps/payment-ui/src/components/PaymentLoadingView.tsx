import { getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { ReactNode } from 'react';
import { RiCheckFill } from 'react-icons/ri';
import { useSelector } from 'react-redux';
import { twMerge } from 'tailwind-merge';

const StepBar = ({ completed, include }: { completed: boolean; include: boolean }) => (
    <div
        className={twMerge(
            'w-1/2 scale-105',
            'h-1',
            !include ? 'bg-background' : completed ? 'bg-black' : 'bg-gray-200',
            'self-center',
        )}
    />
);

const Circle = ({ color, children }: { color: string; children: ReactNode }) => (
    <div className={twMerge('w-5', 'h-5', 'rounded-full', 'flex', 'items-center', 'justify-center', color)}>
        {children}
    </div>
);

const CompletedStep = () => (
    <div>
        <Circle color="bg-black">
            <span className={twMerge('text-white', 'p-1')}>
                <RiCheckFill />
            </span>
        </Circle>
    </div>
);

const PendingStep = () => (
    <div>
        <Circle color="bg-black p-2">
            <span className="loading loading-spinner p-1.5 text-white"></span>
        </Circle>
    </div>
);

const WaitingStep = () => (
    <div>
        <Circle color="bg-white border border-4">{}</Circle>
    </div>
);

const stepLabels = ['Submitting', 'Approving', 'Processing', 'Completing'];
const stepLabelsPast = ['Submitted', 'Approved', 'Processed', 'Completed'];

const StepComponent = ({ status }: { status: string }) => {
    let Step;
    if (status === 'completed') {
        Step = CompletedStep;
    } else if (status === 'pending') {
        Step = PendingStep;
    } else {
        Step = WaitingStep;
    }

    return (
        <div className={twMerge('flex flex-col items-center text-center relative z-10')}>
            <Step />
        </div>
    );
};

const getStepStatus = ({ index, currentStep }: { index: number; currentStep: number }) => {
    if (index < currentStep) {
        return 'completed';
    } else if (index === currentStep) {
        return 'pending';
    } else {
        return 'waiting';
    }
};

export const PaymentLoadingView = () => {
    const mergedState = useSelector(getMergedState);

    const currentStep = mergedState - 1;

    console.log(currentStep, 'currentStep');

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-black text-center text-xl mt-16 mb-9">Transaction in progress</h2>
            <div className="grid grid-cols-4 place-items-stretch text-sm w-96 text-center gap-y-3">
                {stepLabels.map((label, index) => {
                    const status = getStepStatus({ index, currentStep });
                    return (
                        <div key={label} className="flex flex-row">
                            {<StepBar completed={currentStep > index - 1} include={index > 0} />}
                            <StepComponent status={status} />
                            {<StepBar completed={currentStep > index} include={1 < stepLabels.length - index} />}
                        </div>
                    );
                })}
                {stepLabels.map((label, index) => (
                    <p key={index} className={currentStep >= index ? 'text-black' : 'text-gray-400'}>
                        {currentStep > index ? stepLabelsPast[index] : label}
                    </p>
                ))}
            </div>
        </div>
    );
};
