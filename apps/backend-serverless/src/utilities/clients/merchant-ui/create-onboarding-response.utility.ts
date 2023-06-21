import { KybState, Merchant } from '@prisma/client';

export interface OnboardingResponse {
    completed: boolean;
    acceptedTermsAndConditions: boolean;
    acceptedPrivacyPolicy: boolean;
    addedWallet: boolean;
    dismissedCompleted: boolean;
    kybState: KybState;
}

export const createOnboardingResponse = (merchant: Merchant) => {
    const acceptedTermsAndConditions = merchant.acceptedTermsAndConditions;
    const acceptedPrivacyPolicy = merchant.acceptedPrivacyPolicy;
    const addedWallet = merchant.walletAddress != null || merchant.tokenAddress != null;
    const kybState = merchant.kybState;
    const dismissCompleted = merchant.dismissCompleted;

    return {
        completed: acceptedTermsAndConditions && acceptedPrivacyPolicy && addedWallet && kybState == 'finished',
        acceptedTermsAndConditions: acceptedTermsAndConditions,
        acceptedPrivacyPolicy: acceptedPrivacyPolicy,
        addedWallet: addedWallet,
        dismissedCompleted: dismissCompleted,
        kybState: kybState,
    };
};
