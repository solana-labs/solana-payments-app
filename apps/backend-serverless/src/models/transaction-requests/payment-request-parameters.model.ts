import { InferType, boolean, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';

export const paymentRequestParametersScheme = object().shape({
    paymentId: string().required(),
    payWithPoints: boolean().default(false).required(),
});

export type PaymentRequestParameters = InferType<typeof paymentRequestParametersScheme>;

export const parseAndValidatePaymentRequest = (paymentStatusRequestParameters: unknown): PaymentRequestParameters => {
    let params = paymentStatusRequestParameters as { [index: string]: any };

    // Convert 'true' or 'false' strings into booleans.
    if (typeof params.payWithPoints === 'string') {
        params.payWithPoints = params.payWithPoints === 'true';
    }

    return parseAndValidateStrict(
        params,
        paymentRequestParametersScheme,
        'Can not parse payment transaction request parameters. Unknown reason.'
    );
};
