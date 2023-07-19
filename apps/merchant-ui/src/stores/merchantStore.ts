import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';

interface LoyaltyProgram {
    loyaltyProgram: 'none' | 'points';
    pointsMint: string | null;
    pointsBack: number;
}
interface MerchantInfo {
    shop: string;
    name: string;
    paymentAddress: string;
    acceptedTermsAndConditions: boolean;
    acceptedPrivacyPolicy: boolean;
    dismissCompleted: boolean;
    completed: boolean;
    kybState?: 'pending' | 'failed' | 'finished' | 'incomplete';
    kybInquiry?: string;
    completedRedirect: string;
    loyalty: LoyaltyProgram;
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
                    acceptedTermsAndConditions: merchantJson.merchantData.onboarding.acceptedTermsAndConditions,
                    acceptedPrivacyPolicy: merchantJson.merchantData.onboarding.acceptedPrivacyPolicy,
                    dismissCompleted: merchantJson.merchantData.onboarding.dismissCompleted,
                    completed: merchantJson.merchantData.onboarding.completed,
                    kybInquiry: merchantJson.merchantData.onboarding.kybInquiry,
                    kybState: merchantJson.merchantData.onboarding.kybState,
                    completedRedirect: merchantJson.merchantData.onboarding.completedRedirect,
                    loyalty: {
                        loyaltyProgram: merchantJson.merchantData.loyalty.loyaltyProgram,
                        pointsMint: merchantJson.merchantData.loyalty.pointsMint,
                        pointsBack: merchantJson.merchantData.loyalty.pointsBack,
                    },
                }),
            });
        } catch (error) {
            set({ merchantInfo: RE.failed(new Error('Failed to fetch merchant info')) });
        }
    },
}));

export async function updateMerchant(field: string, value: string | boolean | number) {
    const headers = {
        'Content-Type': 'application/json',
    };

    let response;

    try {
        response = await fetch(API_ENDPOINTS.updateMerchant, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ [field]: value }),
            credentials: 'include',
        });
        if (response.status != 200) {
            throw new Error('Error updating merchant data');
        }
    } catch (error) {
        console.error('Failed to update merchant data', error);
        throw new Error('Failed to update merchant data');
    }
    return response;
}
