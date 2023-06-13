// import {
//     PaymentRecord,
//     PaymentRecordStatus,
//     PrismaClient,
//     TransactionRecord,
//     TransactionType,
//     WebsocketSession,
// } from '@prisma/client';
// import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
// import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
// import { MerchantService } from '../database/merchant-service.database.service.js';
// import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service.js';
// import axios from 'axios';
// import {
//     verifyRecordWithHeliusTranscation,
//     verifyTransactionWithRecord,
// } from '../transaction-validation/validate-discovered-payment-transaction.service.js';
// import * as web3 from '@solana/web3.js';
// import { sendPaymentResolveRetryMessage } from '../sqs/sqs-send-message.service.js';
// import { validatePaymentSessionResolved } from '../shopify/validate-payment-session-resolved.service.js';
// import * as Sentry from '@sentry/serverless';
// import { fetchTransaction } from '../fetch-transaction.service.js';
// import { delay } from '../../utilities/delay.utility.js';
// import { sendWebsocketMessage } from '../websocket/send-websocket-message.service.js';
// import { WebsocketSessionService } from '../database/websocket.database.service.js';

// export const processDiscoveredPaymentTransaction = async (
//     paymentRecord: PaymentRecord,
//     transaction: HeliusEnhancedTransaction,
//     prisma: PrismaClient,
//     websocketSessions: WebsocketSession[]
// ) => {
//     const paymentRecordService = new PaymentRecordService(prisma);
//     const merchantService = new MerchantService(prisma);

//     const merchant = await merchantService.getMerchant({
//         id: paymentRecord.merchantId,
//     });

//     if (merchant == null) {
//         // Another situation that shouldn't happen but could if a merchant deletes our app and we try to
//         // process some kind of transaction after they're deleted
//         // TODO: Figure out what happens if a merchant deletes our app but then a customer wants a refund
//         Sentry.captureException(new Error('Merchant not found with merchant id'));
//         throw new Error('Merchant not found with merchant id.');
//     }

//     console.log('got the merchant');

//     if (merchant.accessToken == null) {
//         // This isn't likely as we shouldn't be gettings calls to create payments for merchants without
//         // access tokens. A more likely situation is that the access token is invalid. This could mean
//         // that the access token was deleted for some reason which would be a bug.
//         Sentry.captureException(new Error('Merchant not found with merchant id'));
//         throw new Error('Access token not found on merchant.');
//     }

//     verifyRecordWithHeliusTranscation(paymentRecord, transaction, true);

//     console.log('verified with helius');

//     let rpcTransaction: web3.Transaction | null = null;

//     while (rpcTransaction == null) {
//         try {
//             await delay(3000);
//             rpcTransaction = await fetchTransaction(transaction.signature);
//         } catch (error) {}
//     }

//     console.log('got the transaction');

//     // Verify against the payment record, if we throw in here, we should catch outside of this for logging
//     verifyTransactionWithRecord(paymentRecord, rpcTransaction, true);

//     console.log('transaction is real');

//     // let's say it goes bad here, what would we do? at least we know when it will go bad.
//     // anywher we throw, it "goes bad"
//     // we should def send a message to the frontend to let them know it's bad
//     // ok so i probably dont want to check everywhere, i should prob do it outside of this
//     // but outside of this i dont have the payment record, fuggggg, maybe i should pass it in then

//     // -- if we get here, we found a match! --
//     // we would hope at this point we could update the database to reflect we found it's match
//     // need to make sure we can guarentee that this can always go back and fix itself
//     // TODO: Figure out strategy for retrying this if it fails, I think cron job will suffice but
//     // let's be sure. No state should have changed so cron job should cover us.
//     // TODO, update can fail so add try/catch here
//     await paymentRecordService.updatePaymentRecord(paymentRecord, {
//         status: PaymentRecordStatus.paid,
//         transactionSignature: transaction.signature,
//     });

//     console.log('updated to paid');

//     // TODO: This is temporary until i make a more powerful query that gets everything
//     if (paymentRecord.shopGid == null) {
//         throw new Error('Shop gid not found on payment record');
//     }

//     try {
//         const paymentSessionResolve = makePaymentSessionResolve(axios);

//         const resolvePaymentResponse = await paymentSessionResolve(
//             paymentRecord.shopGid,
//             merchant.shop,
//             merchant.accessToken
//         );

//         const resolvePaymentData = validatePaymentSessionResolved(resolvePaymentResponse);

//         await paymentRecordService.updatePaymentRecord(paymentRecord, {
//             status: PaymentRecordStatus.completed,
//             redirectUrl: resolvePaymentData.redirectUrl,
//             completedAt: new Date(),
//         });

//         for (const websocketSession of websocketSessions) {
//             try {
//                 await sendWebsocketMessage(websocketSession.connectionId, {
//                     messageType: 'completedDetails',
//                     completedDetails: {
//                         redirectUrl: resolvePaymentData.redirectUrl,
//                     },
//                 });
//             } catch (error) {
//                 // prob just closed and orphaned
//                 continue;
//             }
//         }
//     } catch (error) {
//         // TODO: Log the error with Sentry, generally could be a normal situation to arise but it's still good to try why it happened
//         Sentry.captureException(error);
//         try {
//             await sendPaymentResolveRetryMessage(paymentRecord.id);
//         } catch (err) {
//             // TODO: This would be an odd error to hit, sending messages to the queue shouldn't fail. It will be good to log this
//             // with sentry and figure out why it happened. Also good to figure out some kind of redundancy here. Also good to
//             // build in a way to manually intervene here if needed.
//         }
//     }
// };
