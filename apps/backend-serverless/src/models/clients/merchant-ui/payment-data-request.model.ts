import { InferType, mixed, object } from 'yup';
import { DEFAULT_PAGINATION_SIZE } from '../../../utilities/clients/merchant-ui/database-services.utility.js';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';

export const paymentDataRequestParametersSchema = object().shape({
    pageNumber: mixed()
        .test('isNumber', 'pageNumber must be a number', value => {
            const parsedValue = Number(value);
            return !isNaN(parsedValue) && Number.isInteger(parsedValue) && parsedValue >= 1;
        })
        .default(1),
    pageSize: mixed()
        .test('isNumber', 'pageSize must be a number', value => {
            const parsedValue = Number(value);
            return !isNaN(parsedValue) && Number.isInteger(parsedValue) && parsedValue >= 1;
        })
        .default(DEFAULT_PAGINATION_SIZE),
});

export type PaymentDataRequestParameters = InferType<typeof paymentDataRequestParametersSchema>;

export const parseAndValidatePaymentDataRequestParameters = (
    paymentDataRequestParmatersBody: unknown
): PaymentDataRequestParameters => {
    return parseAndValidateStrict(
        paymentDataRequestParmatersBody,
        paymentDataRequestParametersSchema,
        'Could not parse the payment data request parameters. Unknown Reason.'
    );
};
