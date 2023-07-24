const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

const envDirectories = [
    'apps/backend-serverless',
    'apps/merchant-ui',
    'apps/payment-ui',
    'apps/transaction-request-serverless',
];

const envMapping = {
    'apps/backend-serverless': '.env.dev',
    'apps/backend-serverless': '.env.staging',
    'apps/backend-serverless': '.env.production',
    'apps/transaction-request-serverless': '.env.dev',
    'apps/transaction-request-serverless': '.env.staging',
    'apps/transaction-request-serverless': '.env.production',
    'apps/merchant-ui': '.env',
    'apps/payment-ui': '.env',
};

envDirectories.forEach(dir => {
    const src = path.join(baseDir, dir, '.sample.env');
    const dest = path.join(baseDir, dir, envMapping[dir]);
    fs.copyFileSync(src, dest);
    console.log(`Copied .sample.env from ${dir} to ${envMapping[dir]}`);
});
