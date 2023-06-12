import Checkmark from '@carbon/icons-react/lib/Checkmark';
import React from 'react';
import { twMerge } from 'tailwind-merge';

const StepBar = ({ completed }) => (
    <div className={twMerge('w-1/4', 'h-1', completed ? 'bg-black' : 'bg-gray-200', 'self-center')} />
);

const Circle = ({ color, children }) => (
    <div className={twMerge('w-5', 'h-5', 'rounded-full', 'flex', 'items-center', 'justify-center', color)}>
        {children}
    </div>
);

const CompletedStep = ({ label }) => (
    <div>
        <Circle color="bg-black">
            <span className={twMerge('text-white', 'p-1')}>
                <Checkmark />
            </span>
        </Circle>
        {/* <p className="text-center">{label}</p> */}
    </div>
);

const PendingStep = ({ label }) => (
    <div>
        <Circle color="bg-black p-2">
            <span className="loading loading-spinner p-2"></span>
        </Circle>
        {/* <p className="text-center">{label}</p> */}
    </div>
);

const WaitingStep = ({ label }) => (
    <div>
        <Circle color="bg-white border border-4" />
        {/* <p className="text-center">{label}</p> */}
    </div>
);

const StepComponent = ({ status, label }) => {
    let Step;
    if (status === 'completed') {
        Step = CompletedStep;
    } else if (status === 'pending') {
        Step = PendingStep;
    } else {
        Step = WaitingStep;
    }

    return (
        <div className={twMerge('flex flex-col items-center text-center')}>
            <Step />
        </div>
    );
};

const stepLabels = ['Submitting', 'Approving', 'Processing', 'Completing'];
const stepLabelsPast = ['Submitted', 'Approved', 'Processed', 'Completed'];

const getStepStatus = (index, currentStep) => {
    if (index < currentStep) {
        return 'completed';
    } else if (index === currentStep) {
        return 'pending';
    } else {
        return 'waiting';
    }
};

export const PaymentLoadingView = () => {
    const currentStep = 2;

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-black text-center text-xl mt-16">Transaction in progress</h2>
            <div className="flex flex-row justify-center w-72 mt-9">
                {stepLabels.map((label, index) => {
                    const status = getStepStatus(index, currentStep);
                    return (
                        <React.Fragment key={label}>
                            <StepComponent status={status} label={label} />
                            {index < stepLabels.length - 1 && <StepBar completed={currentStep > index} />}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="flex flex-row justify-between text-sm w-80 mt-3">
                {stepLabels.map((label, index) => (
                    <p className={currentStep === index ? 'text-black' : 'text-gray-400'}>
                        {currentStep > index ? stepLabelsPast[index] : label}
                    </p>
                ))}
            </div>
        </div>
    );
};
