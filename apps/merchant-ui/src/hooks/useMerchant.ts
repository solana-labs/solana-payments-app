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
}

export function useMerchant(): RE.Result<MerchantInfo> {
    const [merchantInfo, setMerchantInfo] = useState<RE.Result<MerchantInfo>>(RE.pending());

    useEffect(() => {
        const fetchMerchantInfo = async () => {
            const merchantInfoResponse = await fetch(API_ENDPOINTS.merchantData);
            const merchantJson = await merchantInfoResponse.json();

            console.log('merchantJson', merchantJson);

            setMerchantInfo(
                RE.ok({
                    shop: merchantJson.merchantData.shop,
                    name: merchantJson.merchantData.name,
                    paymentAddress: merchantJson.merchantData.paymentAddress,
                    acceptedTermsAndConditions: merchantJson.merchantData.onboarding.acceptedTerms,
                    dismissCompleted: merchantJson.merchantData.onboarding.dismissCompleted,
                })
            );
        };
        fetchMerchantInfo().catch(console.error);
    }, []);

    return merchantInfo;
}

export async function updateMerchantAddress(walletAddress: PublicKey | null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        console.log('wallet address', walletAddress?.toString());
        const response = await axios.put(
            API_ENDPOINTS.updateMerchant,
            {
                paymentAddress: walletAddress?.toString(),
            },
            { headers: headers }
        );
        console.log('update wallet response', response);
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
                acceptedTermsAndConditions: true,
            },
            { headers: headers }
        );
        console.log('update wallet response', response);
    } catch (error) {
        console.log('update wallet error', error);
    }
}
