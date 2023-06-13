// const { Helius } = require("helius-sdk");
// const dotenv = require("dotenv");

// dotenv.config({ path: ".env.dev" });
// const helius = new Helius(process.env.HELIUS_API_KEY);
// const webhookUrl = process.env.HELIUS_WEBHOOK_URL;

// console.log(process.env.HELIUS_WEBHOOK_URL)
// console.log(process.env.HELIUS_API_KEY)

// helius.getAllWebhooks().then((webhooks) => {

//   if (webhooks.length == 0) {

//     helius.createWebhook({
//       webhookURL: webhookUrl,
//       transactionTypes: ['ANY'],
//       accountAddresses: ['9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T'],
//       webhookType: 'enhanced',
//       encoding: 'jsonParsed',
//     }).then((webhook) => {
//       console.log("Created webhook with helius: ", webhook.webhookID);
//     }).catch((err) => {
//       console.log("Could not create webhook with helius: ", err);
//     })

//   } else {

//     helius.editWebhook(
//       webhooks[0].webhookID,
//       { accountAddresses: ['9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T'] } // This will ONLY update accountAddresses, not the other fields on the webhook object
//     ).then((webhook) => {
//       console.log("Edited webhook with helius: ", webhook.webhookID)
//     }).catch((err) => {
//       console.log("Could not edit webhook with helius: ", err);
//     })
    
//   }

// })