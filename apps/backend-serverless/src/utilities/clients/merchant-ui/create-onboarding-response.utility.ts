import { KybState, Merchant } from '@prisma/client';

export interface OnboardingResponse {
    completed: boolean;
    acceptedTerms: boolean;
    addedWallet: boolean;
    dismissedCompleted: boolean;
    kybState: KybState;
}

export const createOnboardingResponse = (merchant: Merchant) => {
    const acceptedTermsAndConditions = merchant.acceptedTermsAndConditions;
    const addedWallet = merchant.paymentAddress != null;
    const kybState = merchant.kybState;
    const dismissCompleted = merchant.dismissCompleted;

    return {
        completed: acceptedTermsAndConditions && addedWallet && kybState == 'finished',
        acceptedTerms: acceptedTermsAndConditions,
        addedWallet: addedWallet,
        dismissedCompleted: dismissCompleted,
        kybState: kybState,
    };
};
