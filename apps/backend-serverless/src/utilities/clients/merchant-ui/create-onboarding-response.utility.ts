import { Merchant } from '@prisma/client';

export const createOnboardingResponse = (merchant: Merchant) => {
    const acceptedTermsAndConditions = merchant.acceptedTermsAndConditions;
    const addedWallet = merchant.paymentAddress != null;
    const kybState = 'finished';
    const dismissCompleted = merchant.dismissCompleted;

    return {
        completed: acceptedTermsAndConditions && addedWallet && kybState == 'finished',
        acceptedTerms: acceptedTermsAndConditions,
        addedWallet: addedWallet,
        dismissedCompleted: dismissCompleted,
        kybState: kybState,
    };
};
