import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const connectSchema = object().shape({
    paymentId: string().required(),
});

export type ConnectParameters = InferType<typeof connectSchema>;

export const parseAndValidateConnectSchema = (connectSchemaBody: unknown): ConnectParameters => {
    return parseAndValidateStrict(
        connectSchemaBody,
        connectSchema,
        'Could not parse the merchant auth token body. Unknown Reason.',
    );
};
