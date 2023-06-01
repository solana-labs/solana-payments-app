import axios from 'axios';
import {
    TrmWalletScreenResponse,
    parseAndValidateTrmWalletScreenResponse,
} from '../models/dependencies/trm-wallet-screen-response.model.js';
import { TRM_CHAIN_SOLANA_ID, TRM_MAX_RISK_LEVEL, TRM_SCREEN_URL } from '../configs/trm.config.js';
import { retry } from '../utilities/shopify-retry/shopify-retry.utility.js';
import { DependencyError } from '../errors/dependency.error.js';
import { RiskyWalletError } from '../errors/risky-wallet.error.js';

export class TrmService {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async screenAddress(address: string) {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${this.apiKey}:${this.apiKey}`).toString('base64'),
        };

        const body = [
            {
                address: address,
                chain: TRM_CHAIN_SOLANA_ID,
            },
        ];

        const maxAttempts = 3;
        let trmResponse: TrmWalletScreenResponse | null = null;

        const attempts = await retry(async () => {
            const response = await axios.post(TRM_SCREEN_URL, body, { headers });
            trmResponse = parseAndValidateTrmWalletScreenResponse(response.data);
        }, maxAttempts);

        if (attempts == maxAttempts) {
            throw new DependencyError('trm');
        }

        if (trmResponse == null) {
            throw new DependencyError('trm');
        }

        this.validateRiskLevelBelowMax(trmResponse);

        try {
            const response = await axios.post(TRM_SCREEN_URL, body, { headers });
            const parsedResponse: TrmWalletScreenResponse = parseAndValidateTrmWalletScreenResponse(response.data);
            this.validateRiskLevelBelowMax(parsedResponse);
        } catch (error) {
            throw error;
        }
    }

    private validateRiskLevelBelowMax(response: TrmWalletScreenResponse) {
        const riskLevelBelow5 = response.every((item: any) =>
            item.entities.every((entity: any) => entity.riskScoreLevel < TRM_MAX_RISK_LEVEL)
        );

        if (!riskLevelBelow5) {
            throw new RiskyWalletError();
        }
    }
}
