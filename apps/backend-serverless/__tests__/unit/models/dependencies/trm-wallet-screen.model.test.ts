import {
    runEmptyFieldTests,
    runInvalidFieldTypeTests,
    runMissingFieldTests,
    runValidParameterTest,
} from '../../../../src/utilities/testing-helper/common-model-test.utility.js';

import { parseAndValidateTrmWalletScreenResponse } from '../../../../src/models/dependencies/trm-wallet-screen-response.model.js';

describe('unit testing the trm wallet screen model', () => {
    const validParams = [
        {
            accountExternalId: 'externalId',
            address: 'address',
            addressIncomingVolumeUsd: '1000',
            addressOutgoingVolumeUsd: '500',
            addressRiskIndicators: [
                {
                    category: 'Category 1',
                    categoryId: 'CatID',
                    categoryRiskScoreLevel: 1,
                    categoryRiskScoreLevelLabel: 'Low',
                    incomingVolumeUsd: '500',
                    outgoingVolumeUsd: '300',
                    riskType: 'Type 1',
                    totalVolumeUsd: '800',
                },
            ],
            addressSubmitted: 'submitted',
            addressTotalVolumeUsd: '1500',
            chain: 'Chain 1',
            entities: [
                {
                    category: 'Entity Category',
                    categoryId: 'EntityCatID',
                    entity: 'Entity 1',
                    riskScoreLevel: 2,
                    riskScoreLevelLabel: 'Medium',
                    trmAppUrl: 'http://example.com',
                    trmUrn: 'Urn',
                },
            ],
            trmAppUrl: 'http://example.com',
        },
    ];

    const fields = [
        'accountExternalId',
        'address',
        'addressIncomingVolumeUsd',
        'addressOutgoingVolumeUsd',
        'addressRiskIndicators',
        'addressSubmitted',
        'addressTotalVolumeUsd',
        'chain',
        'entities',
        'trmAppUrl',
    ];

    const addressRiskIndicatorsFields = [
        'category',
        // 'categoryId',
        // 'categoryRiskScoreLevel',
        // 'categoryRiskScoreLevelLabel',
        // 'incomingVolumeUsd',
        // 'outgoingVolumeUsd',
        // 'riskType',
        // 'totalVolumeUsd',
    ];

    const entitiesFields = [
        'category',
        'categoryId',
        'entity',
        'riskScoreLevel',
        'riskScoreLevelLabel',
        'trmAppUrl',
        'trmUrn',
    ];

    const wrongTypes: Record<string, any> = [
        {
            accountExternalId: 123,
            address: 123,
            addressIncomingVolumeUsd: 123,
            addressOutgoingVolumeUsd: 123,
            addressRiskIndicators: [
                {
                    category: 123,
                    categoryId: 123,
                    categoryRiskScoreLevel: 'abc',
                    categoryRiskScoreLevelLabel: 123,
                    incomingVolumeUsd: 123,
                    outgoingVolumeUsd: 123,
                    riskType: 123,
                    totalVolumeUsd: 123,
                },
            ],
            addressSubmitted: 123,
            addressTotalVolumeUsd: 123,
            chain: 123,
            entities: [
                {
                    category: 123,
                    categoryId: 123,
                    entity: 123,
                    riskScoreLevel: 'abc',
                    riskScoreLevelLabel: 123,
                    trmAppUrl: 123,
                    trmUrn: 123,
                },
            ],
            trmAppUrl: 123,
        },
    ];

    const wrongTypes2 = {
        category: 123,
        categoryId: 123,
        categoryRiskScoreLevel: 'abc',
        categoryRiskScoreLevelLabel: 123,
        incomingVolumeUsd: 123,
        outgoingVolumeUsd: 123,
        riskType: 123,
        totalVolumeUsd: 123,
    };

    const wrongTypes3 = {
        category: 123,
        categoryId: 123,
        entity: 123,
        riskScoreLevel: 'abc',
        riskScoreLevelLabel: 123,
        trmAppUrl: 123,
        trmUrn: 123,
    };

    runValidParameterTest(parseAndValidateTrmWalletScreenResponse, validParams);
    runMissingFieldTests(parseAndValidateTrmWalletScreenResponse, validParams, fields);
    runInvalidFieldTypeTests(parseAndValidateTrmWalletScreenResponse, validParams, fields, wrongTypes);
    runEmptyFieldTests(parseAndValidateTrmWalletScreenResponse, validParams, fields);
});
