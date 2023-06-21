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
    const clientId = process.env.SHOPIFY_CLIENT_ID;

    const acceptedTermsAndConditions = merchant.acceptedTermsAndConditions;
    const acceptedPrivacyPolicy = merchant.acceptedPrivacyPolicy;
    const addedWallet = merchant.walletAddress != null || merchant.tokenAddress != null;
    const kybState = merchant.kybState;
    const dismissCompleted = merchant.dismissCompleted;

    const redirectURL = `https://${merchant.shop}.myshopify.com/services/payments_partners/gateways/${clientId}/settings`;

    console.log('the redirect link', merchant.shop, clientId, ur);

    return {
        completed:
            acceptedTermsAndConditions &&
            acceptedPrivacyPolicy &&
            dismissCompleted &&
            addedWallet &&
            kybState == 'finished',
        acceptedTermsAndConditions: acceptedTermsAndConditions,
        acceptedPrivacyPolicy: acceptedPrivacyPolicy,
        addedWallet: addedWallet,
        dismissedCompleted: dismissCompleted,
        kybState: kybState,
        completedRedirect: redirectURL,
    };
};
