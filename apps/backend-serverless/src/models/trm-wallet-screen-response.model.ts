import { object, string, number, date, InferType, array } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

const trmAddressRiskIndicatorsSchema = object().shape({
    category: string().required(),
    categoryId: string().required(),
    categoryRiskScoreLevel: number().required(),
    categoryRiskScoreLevelLabel: string().required(),
    incomingVolumeUsd: string().required(),
    outgoingVolumeUsd: string().required(),
    riskType: string().required(),
    totalVolumeUsd: string().required(),
});

const trmEntitiesSchema = object().shape({
    category: string().required(),
    categoryId: string().required(),
    entity: string().nullable(),
    riskScoreLevel: number().required(),
    riskScoreLevelLabel: string().required(),
    trmAppUrl: string().required(),
    trmUrn: string().required(),
});

export const trmWalletScreenModelSchema = object().shape({
    accountExternalId: string().nullable(),
    address: string().required(),
    addressIncomingVolumeUsd: string().nullable(),
    addressOutgoingVolumeUsd: string().nullable(),
    addressRiskIndicators: array().of(trmAddressRiskIndicatorsSchema).required(),
    addressSubmitted: string().required(),
    addressTotalVolumeUsd: string().nullable(),
    chain: string().required(),
    entities: array().of(trmEntitiesSchema).required(),
    trmAppUrl: string().required(),
});

export const trmWalletScreenResponseSchema = array().of(trmWalletScreenModelSchema).required();

export type TrmWalletScreenResponse = InferType<typeof trmWalletScreenResponseSchema>;

export const parseAndValidateTrmWalletScreenResponse = (walletScreenResponse: unknown): TrmWalletScreenResponse => {
    return parseAndValidate(
        walletScreenResponse,
        trmWalletScreenResponseSchema,
        'Failed to parse and validate TRM wallet screen response. Unknown reason.'
    );
};
