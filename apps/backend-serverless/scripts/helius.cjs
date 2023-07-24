const { Helius } = require('helius-sdk');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.dev' });
const helius = new Helius(process.env.HELIUS_API_KEY);

helius.getAllWebhooks().then(webhooks => {
    if (webhooks.length == 0) {
        helius
            .createWebhook({
                webhookURL: webhookUrl,
                transactionTypes: ['ANY'],
                accountAddresses: [process.env.GAS_KEYPAIR_SECRET],
                webhookType: 'enhanced',
                encoding: 'jsonParsed',
            })
            .then(webhook => {
                console.log('Created webhook with helius: ', webhook.webhookID);
            })
            .catch(err => {
                console.log('Could not create webhook with helius: ', err);
            });
    } else {
        helius
            .editWebhook(
                webhooks[0].webhookID,
                { accountAddresses: [process.env.GAS_KEYPAIR_SECRET] } // This will ONLY update accountAddresses, not the other fields on the webhook object
            )
            .then(webhook => {
                console.log('Edited webhook with helius: ', webhook.webhookID);
            })
            .catch(err => {
                console.log('Could not edit webhook with helius: ', err);
            });
    }
});
