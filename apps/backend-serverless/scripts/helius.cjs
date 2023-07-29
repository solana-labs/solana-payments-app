const bs58 = require('bs58');
const web3 = require('@solana/web3.js');
const axios = require('axios');
const { Helius } = require('helius-sdk');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.dev' });

if (!process.env.HELIUS_API_KEY) {
    throw new Error('HELIUS API KEY not set in .env.dev');
}
if (!process.env.GAS_KEYPAIR_SECRET) {
    throw new Error('GAS_KEYPAIR_SECRET not set in .env.dev');
}

const helius = new Helius(process.env.HELIUS_API_KEY);
axios
    .get('http://127.0.0.1:4040/api/tunnels')
    .then(response => {
        // Here we directly parse the JSON like how `jq` would.
        const publicUrl = response.data.tunnels[0].public_url + '/helius';
        const address = web3.Keypair.fromSecretKey(bs58.decode(process.env.GAS_KEYPAIR_SECRET)).publicKey.toString();

        helius.getAllWebhooks().then(webhooks => {
            if (webhooks.length == 0) {
                helius
                    .createWebhook({
                        webhookURL: publicUrl,
                        transactionTypes: ['ANY'],
                        accountAddresses: [address],
                        webhookType: 'enhanced',
                        encoding: 'jsonParsed',
                    })
                    .then(webhook => {
                        console.log('Created webhook with helius: ', webhook.webhookID, ' at ', publicUrl);
                    })
                    .catch(err => {
                        console.log('Could not create webhook with helius: ', err);
                    });
            } else {
                helius
                    .editWebhook(
                        webhooks[0].webhookID,
                        {
                            webhookURL: publicUrl,
                            accountAddresses: [address],
                        } // This will ONLY update accountAddresses, not the other fields on the webhook object
                    )
                    .then(webhook => {
                        console.log('Edited webhook with helius: ', webhook.webhookID, ' at ', publicUrl);
                    })
                    .catch(err => {
                        console.log('Could not edit webhook with helius: ', err);
                    });
            }
        });
    })
    .catch(error => {
        console.error('Error fetching ngrok tunnel:', error.message);
    });
