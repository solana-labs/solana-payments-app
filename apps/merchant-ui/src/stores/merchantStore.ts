import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';

export interface Product {
    id: string;
    name: string;
    image?: string;
    active: boolean;
    mint?: string;
    merchantId: string;
}

export interface Tier {
    id: number;
    name: string;
    threshold: number;
    discount: number;
    active: boolean;
    mint?: string;
    merchantId: string;
}

export interface LoyaltyDetails {
    loyaltyProgram: 'none' | 'points' | 'tiers';
    productStatus: 'tree' | 'collection' | 'ready';
    points: {
        pointsMint: string | null;
        pointsBack: number;
    };
    products: Product[];
    tiers: Tier[];
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
    loyalty: LoyaltyDetails;
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
                    loyalty: merchantJson.merchantData.loyaltyDetails,
                }),
            });
        } catch (error) {
            set({ merchantInfo: RE.failed(new Error('Failed to fetch merchant info')) });
        }
    },
}));

const headers = {
    'Content-Type': 'application/json',
};
export async function updateMerchant(field: string, value: string | boolean | number | object) {
    try {
        return await fetch(API_ENDPOINTS.updateMerchant, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ [field]: value }),
            credentials: 'include',
        });
    } catch (error) {
        console.error('Failed to update merchant data', error);
        throw new Error('Failed to update merchant data');
    }
}

export async function updateLoyalty(body: object) {
    try {
        return await fetch(API_ENDPOINTS.updateLoyalty, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
            credentials: 'include',
        });
    } catch (error) {
        console.error('Failed to update loyalty data', error);
        throw new Error('Failed to update loyalty data');
    }
}

export async function manageTiers(body: object) {
    try {
        return await fetch(API_ENDPOINTS.manageTiers, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            credentials: 'include',
        });
    } catch (error) {
        console.error('Failed to update tier data', error);
        throw new Error('Failed to update tier data');
    }
}

export async function manageProducts(body: object) {
    try {
        return await fetch(API_ENDPOINTS.manageProducts, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            credentials: 'include',
        });
    } catch (error) {
        console.error('Failed to update tier data', error);
        throw new Error('Failed to update tier data');
    }
}
