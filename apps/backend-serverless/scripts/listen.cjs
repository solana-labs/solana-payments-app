const { Helius } = require("helius-sdk");
const dotenv = require("dotenv");

dotenv.config();
const helius = new Helius(process.env.HELIUS_API_KEY);
const webhookUrl = process.env.HELIUS_WEBHOOK_URL;

helius.getAllWebhooks().then((webhooks) => {

  if (webhooks.length == 0) {

    helius.createWebhook({
      webhookURL: webhookUrl,
      transactionTypes: ['ANY'],
      accountAddresses: ['9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T'],
      webhookType: 'ENHANCED',
      encoding: 'jsonParsed',
    }).catch((err) => {
      console.log("Could not create webhook with helius: ", err);
    })

  } else {

    helius.editWebhook(
      webhooks[0].webhookID,
      { accountAddresses: ['9hBUxihyvswYSExF8s7K5SZiS3XztF3DAT7eTZ5krx4T'] } // This will ONLY update accountAddresses, not the other fields on the webhook object
    ).catch((err) => {
      console.log("Could not edit webhook with helius: ", err);
    })
    
  }

})