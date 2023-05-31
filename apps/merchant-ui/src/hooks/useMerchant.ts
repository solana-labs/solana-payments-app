import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface MerchantInfo {
    shop: string;
    name: string;
    paymentAddress: string;
    acceptedTermsAndConditions: boolean;
    dismissCompleted: boolean;
    completed: boolean;
}

export function useMerchant(): { merchantInfo: RE.Result<MerchantInfo>; getMerchantInfo: () => Promise<void> } {
    const [merchantInfo, setMerchantInfo] = useState<RE.Result<MerchantInfo>>(RE.pending());

    const getMerchantInfo = async () => {
        const merchantInfoResponse = await fetch(API_ENDPOINTS.merchantData);
        const merchantJson = await merchantInfoResponse.json();

        setMerchantInfo(
            RE.ok({
                shop: merchantJson.merchantData.shop,
                name: merchantJson.merchantData.name,
                paymentAddress: merchantJson.merchantData.paymentAddress,
                acceptedTermsAndConditions: merchantJson.merchantData.onboarding.acceptedTerms,
                dismissCompleted: merchantJson.merchantData.onboarding.dismissCompleted,
                completed: merchantJson.merchantData.onboarding.completed,
            })
        );
    };

    useEffect(() => {
        getMerchantInfo().catch(console.error);
    }, []);

    return { merchantInfo, getMerchantInfo };
}

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
        console.log('update wallet error', error);
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
        console.log('update tos error', error);
    }
}
