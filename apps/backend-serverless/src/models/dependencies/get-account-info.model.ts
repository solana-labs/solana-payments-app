import { InferType, array, boolean, mixed, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export enum PubkeyOwner {
    systemProgram = '11111111111111111111111111111111',
    tokenProgram = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
}

export const valueDataSystemProgramSchema = array().of(string()).required();

export const infoTokenAmountSchema = object().shape({
    amount: string().required(),
    decimals: number().required(),
    uiAmount: number().required(),
    uiAmountString: string().required(),
});

export const parsedInfoSchema = object().shape({
    isNative: boolean().required(),
    mint: string().required(),
    owner: string().required(),
    state: string().required(),
    tokenAmount: infoTokenAmountSchema.required(),
});

export const dataParsedSchema = object().shape({
    info: parsedInfoSchema.required(),
    type: string().required(),
});

export const valueDataTokenProgramSchema = object().shape({
    parsed: dataParsedSchema.required(),
    program: string().required(),
    space: number().required(),
});

export const resultValueSchema = object().shape({
    data: mixed()
        .test('valid-state', 'Invalid state', function (value) {
            return valueDataTokenProgramSchema.isValidSync(value) || valueDataSystemProgramSchema.isValidSync(value);
        })
        .required(),
    executable: boolean().required(),
    lamports: number().required(),
    owner: string().oneOf(Object.values(PubkeyOwner)).required(),
    rentEpoch: number().required(),
});

export const resultContextSchema = object().shape({
    apiVersion: string().required(),
    slot: number().required(),
});

export const getAccountInfoResultSchema = object().shape({
    context: resultContextSchema.required(),
    value: resultValueSchema.required(),
});

export const getAccountInfoResponseSchema = object().shape({
    jsonrpc: string().required(),
    result: getAccountInfoResultSchema.required(),
    id: number().required(),
});

export type GetAccountInfo = InferType<typeof getAccountInfoResponseSchema>;
export type ValueDataTokenProgram = InferType<typeof valueDataTokenProgramSchema>;
export type ValueDataSystemProgram = InferType<typeof valueDataSystemProgramSchema>;

export const parseAndValidateGetAccountInfo = (getAccountInfoResponseBody: unknown): GetAccountInfo => {
    return parseAndValidateStrict(
        getAccountInfoResponseBody,
        getAccountInfoResponseSchema,
        'Could not parse the get account info response body. Unknown Reason.'
    );
};
