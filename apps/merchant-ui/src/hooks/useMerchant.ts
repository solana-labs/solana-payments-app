import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

interface MerchantInfo {
    id: string;
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

            setMerchantInfo(
                RE.ok({
                    id: merchantJson.merchantData.id,
                    shop: merchantJson.merchantData.shop,
                    name: merchantJson.merchantData.name,
                    paymentAddress: merchantJson.merchantData.paymentAddress,
                    acceptedTermsAndConditions: merchantJson.merchantData.acceptedTermsAndConditions,
                    dismissCompleted: merchantJson.merchantData.dismissCompleted,
                })
            );
        };
        fetchMerchantInfo().catch(console.error);
    }, []);

    return merchantInfo;
}
