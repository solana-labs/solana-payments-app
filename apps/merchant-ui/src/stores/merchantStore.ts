import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';
import axios from 'axios';

interface MerchantInfo {
    shop: string;
    name: string;
    paymentAddress: string;
    acceptedTermsAndConditions: boolean;
    dismissCompleted: boolean;
    completed: boolean;
    kybState?: 'pending' | 'failed' | 'finished';
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
            const response = await fetch(API_ENDPOINTS.merchantData);
            const merchantJson = await response.json();

            set({
                merchantInfo: RE.ok({
                    shop: merchantJson.merchantData.shop,
                    name: merchantJson.merchantData.name,
                    paymentAddress: merchantJson.merchantData.paymentAddress,
                    acceptedTermsAndConditions: merchantJson.merchantData.onboarding.acceptedTerms,
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

export async function updateMerchantAddress(walletAddress: string | null | undefined) {
    if (!walletAddress) {
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.put(
            API_ENDPOINTS.updateMerchant,
            {
                paymentAddress: walletAddress,
            },
            { headers: headers }
        );
    } catch (error) {
        console.log('update merchant address error', error);
    }
}

export async function updateMerchantTos() {
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.put(
            API_ENDPOINTS.updateMerchant,
            {
                acceptedTermsAndConditions: 'true',
            },
            { headers: headers }
        );
    } catch (error) {
        console.log('update merchant tos error', error);
    }
}

export async function updateMerchantKybInquiry(kybInquiry: string) {
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        const response = await fetch(API_ENDPOINTS.updateMerchant, {
            headers,
            method: 'PUT',
            body: JSON.stringify({ kybInquiry }),
        });
    } catch (error) {
        console.log('update merchant kyb inquiry error', error);
    }
}
