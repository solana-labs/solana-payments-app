import axios from 'axios';
import { TRM_CHAIN_SOLANA_ID, TRM_MAX_RISK_LEVEL, TRM_SCREEN_URL } from '../configs/trm.config.js';
import { DependencyError } from '../errors/dependency.error.js';
import { MissingEnvError } from '../errors/missing-env.error.js';
import { RiskyWalletError } from '../errors/risky-wallet.error.js';
import {
    TrmWalletScreenResponse,
    parseAndValidateTrmWalletScreenResponse,
} from '../models/dependencies/trm-wallet-screen-response.model.js';
import { retry } from '../utilities/shopify-retry/shopify-retry.utility.js';

export class TrmService {
    constructor() {}

    async screenAddress(address: string) {
        const TRM_API_KEY = process.env.TRM_API_KEY;

        if (TRM_API_KEY == null) {
            throw new MissingEnvError('trm api key');
        }

        const headers = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(`${TRM_API_KEY}:${TRM_API_KEY}`).toString('base64'),
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
            throw new DependencyError('trm attempts hit');
        }

        if (trmResponse == null) {
            throw new DependencyError('trm null');
        }

        this.validateRiskLevelBelowMax(trmResponse);

        const response = await axios.post(TRM_SCREEN_URL, body, { headers });
        const parsedResponse: TrmWalletScreenResponse = parseAndValidateTrmWalletScreenResponse(response.data);
        this.validateRiskLevelBelowMax(parsedResponse);
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
