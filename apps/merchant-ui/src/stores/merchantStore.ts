import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';

interface MerchantInfo {
    shop: string;
    name: string;
    paymentAddress: string;
    acceptedTermsAndConditions: boolean;
    // acceptedPrivacyPolicy: boolean;
    dismissCompleted: boolean;
    completed: boolean;
    kybState?: 'pending' | 'failed' | 'finished' | 'incomplete';
    kybInquiry?: string;
}

type MerchantStore = {
    merchantInfo: RE.Result<MerchantInfo>;
    getMerchantInfo: () => Promise<void>;
};

export const useMerchantStore = create<MerchantStore>(set => ({
    merchantInfo: RE.pending(),

    getMerchantInfo: async () => {
        try {
            const response = await fetch(API_ENDPOINTS.merchantData, {
                credentials: 'include',
            });
            const merchantJson = await response.json();

            set({
                merchantInfo: RE.ok({
                    shop: merchantJson.merchantData.shop,
                    name: merchantJson.merchantData.name,
                    paymentAddress: merchantJson.merchantData.paymentAddress,
                    acceptedTermsAndConditions: merchantJson.merchantData.onboarding.acceptedTerms,
                    // acceptedPrivacyPolicy: merchantJson.merchantData.onboarding.acceptedPrivacyPolicy,
                    dismissCompleted: merchantJson.merchantData.onboarding.dismissCompleted,
                    completed: merchantJson.merchantData.onboarding.completed,
                    kybInquiry: merchantJson.merchantData.onboarding.kybInquiry,
                    kybState: merchantJson.merchantData.onboarding.kybState,
                }),
            });
        } catch (error) {
            set({ merchantInfo: RE.failed(new Error('Failed to fetch merchant info')) });
        }
    },
}));

export async function updateMerchantAddress(walletAddress: string): Promise<Response | undefined> {
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        let response = await fetch(API_ENDPOINTS.updateMerchant, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                paymentAddress: walletAddress,
            }),
            credentials: 'include',
        });
        return response;
    } catch (error) {
        return undefined;
    }
}

export async function updateMerchantTos() {
    const headers = {
        'Content-Type': 'application/json',
    };

    let response;

    try {
        response = await fetch(API_ENDPOINTS.updateMerchant, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                acceptedTermsAndConditions: 'true',
            }),
            credentials: 'include',
        });
    } catch (error) {}
    return response;
}

// export async function updateMerchantPrivacy() {
//     const headers = {
//         'Content-Type': 'application/json',
//     };

//     let response;

//     try {
//         response = await fetch(API_ENDPOINTS.updateMerchant, {
//             method: 'PUT',
//             headers,
//             body: JSON.stringify({
//                 acceptedPrivacyPolicy: 'true',
//             }),
//             credentials: 'include',
//         });
//     } catch (error) {}
//     return response;
// }

export async function updateMerchantKybInquiry(kybInquiry: string) {
    const headers = {
        'Content-Type': 'application/json',
    };

    let response;

    try {
        response = await fetch(API_ENDPOINTS.updateMerchant, {
            headers,
            method: 'PUT',
            body: JSON.stringify({ kybInquiry }),
            credentials: 'include',
        });
    } catch (error) {}
    return response;
}
