import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';
import { publicKeySchema } from '../../public-key-schema.model.js';

export const customerDataRequestParametersScheme = object().shape({
    customerWallet: publicKeySchema.required(),
    paymentId: string().required(),
});

export type CustomerDataRequestParameters = InferType<typeof customerDataRequestParametersScheme>;

export const parseAndValidateCustomerDataRequest = (
    customerDataRequestParameters: unknown
): CustomerDataRequestParameters => {
    return parseAndValidateStrict(
        customerDataRequestParameters,
        customerDataRequestParametersScheme,
        'Can not parse customer data parameters. Unknown reason.'
    );
};
