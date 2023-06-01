import { PrismaClient } from '@prisma/client';
import { AxiosInstance } from 'axios';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';

export type Mutation = string;

export type Endpoint = string;

export type Query = unknown;

export type AccessToken = string;

export class GatherUseCase<InputType, OutputType, SourceType> {
    constructor(private gather: (input: InputType, source: SourceType) => OutputType) {}
}

export class DecideUseCase<D> {
    constructor(private decide: (input: D) => void) {}
}

export class FilterUseCase<F, L> {
    constructor(private filter: (input: F) => L) {}
}

export class RequestUseCase<R> {
    constructor(private request: (input: R) => unknown) {}
}

export class ParseUseCase<P> {
    constructor(private parse: (input: unknown) => P) {}
}

export class ValidateUseCase<P, V> {
    constructor(private validate: (input: P) => V) {}
}

export class SuccessUseCase<S> {
    constructor(private success: (input: S) => void) {}
}

export class FailureUseCase<F> {
    constructor(private failure: (input: F) => void) {}
}

export class SuperShopify<A, B, C, D, E, Z> {
    constructor(
        private gatherUseCase: GatherUseCase<A, B, Z>,
        private decideUseCase: DecideUseCase<B>,
        private preRequestFilterUseCase: FilterUseCase<B, C>,
        private requestUseCase: RequestUseCase<C>,
        private parseUseCase: ParseUseCase<D>,
        private validateUseCase: ValidateUseCase<D, E>,
        private successUseCase: SuccessUseCase<E>,
        private failureUseCase: FailureUseCase<B>
    ) {}
}

// const temp = async () => {
//     const paymentSessionResolveGather = async (input: { paymentId: string }, source: PrismaClient): Promise<> => {
//         const paymentRecordService = new PaymentRecordService(source);
//         const merchantSerice = new MerchantService(source);

//         let paymentRecord = await paymentRecordService.getPaymentRecord({
//             id: input.paymentId,
//         });

//         if (paymentRecord == null) {
//             // This case shouldn't come up because right now we don't have a strategy for pruning
//             // records from the database. So if the transaction record refrences a payment record
//             // but we can't find that payment record, then we have a problem with our database or
//             // how we created this transaction record.
//             throw new Error('Payment record not found.');
//         }

//         if (paymentRecord.merchantId == null) {
//             // Another case that shouldn't happen. This could mean that a payment record got updated to remove
//             // a merchant id or that we created a transaction record without a merchant id.
//             throw new Error('Merchant ID not found on payment record.');
//         }

//         const merchant = await merchantSerice.getMerchant({
//             id: paymentRecord.merchantId,
//         });

//         if (merchant == null) {
//             // Another situation that shouldn't happen but could if a merchant deletes our app and we try to
//             // process some kind of transaction after they're deleted
//             // TODO: Figure out what happens if a merchant deletes our app but then a customer wants a refund
//             throw new Error('Merchant not found with merchant id.');
//         }

//         if (merchant.accessToken == null) {
//             // This isn't likely as we shouldn't be gettings calls to create payments for merchants without
//             // access tokens. A more likely situation is that the access token is invalid. This could mean
//             // that the access token was deleted for some reason which would be a bug.
//             throw new Error('Access token not found on merchant.');
//         }
//     };
// };

/**
 *
 * Thoughts / Questions
 *
 * i'm not sure how to handle inputs for the different types
 *
 */

// export class RequestUseCase {
//     constructor(
//         private mutation: Mutation,
//         private query: Query,
//         private endpoint: Endpoint,
//         private accessToken: AccessToken,
//         private axiosInstance: AxiosInstance
//     ) {}

//     async execute() {
//         const headers = {
//             'content-type': 'application/json',
//             'X-Shopify-Access-Token': this.accessToken,
//         };

//         const response = await this.axiosInstance({
//             url: this.endpoint,
//             method: 'POST',
//             headers: headers,
//             data: JSON.stringify(this.query),
//         });

//         switch (response.status) {
//             case 400:
//                 throw new Error('Bad Request');
//             case 402:
//                 throw new Error('Payment Required');
//                 break;
//             case 403:
//                 throw new Error('Forbidden');
//             case 404:
//                 throw new Error('Not Found');
//             case 423:
//                 throw new Error('Locked');
//             case 500:
//                 throw new Error('Internal Shopify Server Error');
//         }
//     }
// }
