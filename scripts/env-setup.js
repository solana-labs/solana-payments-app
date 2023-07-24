const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

const envDirectories = [
    '/',
    'apps/backend-serverless',
    'apps/merchant-ui',
    'apps/payment-ui',
    'apps/transaction-request-serverless',
    'apps/mock-shopify-serverless',
];

const envMapping = {
    '/': ['.env'],
    'apps/backend-serverless': ['.env.dev', '.env.staging', '.env.production'],
    'apps/transaction-request-serverless': ['.env.dev', '.env.staging', '.env.production'],
    'apps/mock-shopify-serverless': ['.env.dev'],
    'apps/merchant-ui': ['.env'],
    'apps/payment-ui': ['.env'],
};

envDirectories.forEach(dir => {
    envMapping[dir].forEach(env => {
        const src = path.join(baseDir, dir, '.sample.env');
        const dest = path.join(baseDir, dir, env);
        fs.copyFileSync(src, dest);
        console.log(`Copied .sample.env from ${dir} to ${env}`);
    });
});
