import { Merchant } from '@prisma/client';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { getCompressedAccounts } from '../../services/transaction-request/products-transaction.service.js';

interface Item {
    id: string;
    content: {
        metadata: {
            name: string;
            description: string;
        };
        links: {
            image: string;
        };
    };
    ownership: {
        owner: string;
    };
    creators: {
        address: string;
    }[];
}

interface Result {
    items: Item[];
}

async function fetchAssetsByGroup(page: number, mint: PublicKey): Promise<Result> {
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (!heliusApiKey) throw new Error('Helius API Key not found');

    const response = await axios({
        url: `https://rpc.helius.xyz/?api-key=${heliusApiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetsByGroup',
            params: {
                groupKey: 'collection',
                groupValue: mint.toBase58(),
                page,
                limit: 1000,
            },
        }),
    });

    return response.data.result;
}

interface ProductDetail {
    id: string;
    name: string;
    image: string;
    description: string;
    creators: string[];
    count: number; // Add this line
}

interface ProductView {
    productDetails: ProductDetail;
    owners: string[];
}

interface CustomerView extends Array<ProductDetail> {}

interface ProductsNftResponse {
    count: number;
    owners: string[];
    productView: Record<string, ProductView>;
    customerView: Record<string, CustomerView>;
}

export const createProductsNftResponse = async (merchant: Merchant): Promise<ProductsNftResponse> => {
    const merchantAddress = new PublicKey(merchant.id);
    const gasKeypair = await fetchGasKeypair();
    const { mint } = await getCompressedAccounts(gasKeypair, merchantAddress);

    const uniqueOwners = new Set();
    const productView = {};
    const customerView = {};

    let page = 1;
    while (true) {
        const result = await fetchAssetsByGroup(page, mint);
        console.log('RESULT', result.items);
        result.items.forEach(item => {
            uniqueOwners.add(item.ownership.owner);

            // Product View
            const productType = item.content.json_uri;
            if (!productView[productType]) {
                productView[productType] = {
                    productDetails: {
                        id: item.id,
                        name: item.content.metadata.name,
                        image: item.content.links.image,
                        description: item.content.metadata.description,
                        creators: item.creators.map(creator => creator.address),
                    },
                    owners: [{ owner: item.ownership.owner, count: 1 }],
                };
            } else {
                const ownerInfo = productView[productType].owners.find(
                    ownInfo => ownInfo.owner === item.ownership.owner
                );
                if (ownerInfo) {
                    ownerInfo.count++;
                } else {
                    productView[productType].owners.push({ owner: item.ownership.owner, count: 1 });
                }
            }

            // Customer View
            if (!customerView[item.ownership.owner]) {
                customerView[item.ownership.owner] = [
                    {
                        id: item.id,
                        name: item.content.metadata.name,
                        image: item.content.links.image,
                        description: item.content.metadata.description,
                        creators: item.creators.map(creator => creator.address),
                        count: 1,
                    },
                ];
            } else {
                const productInfo = customerView[item.ownership.owner].find(prodInfo => prodInfo.id === item.id);
                if (productInfo) {
                    productInfo.count++;
                } else {
                    customerView[item.ownership.owner].push({
                        id: item.id,
                        name: item.content.metadata.name,
                        image: item.content.links.image,
                        description: item.content.metadata.description,
                        creators: item.creators.map(creator => creator.address),
                        count: 1,
                    });
                }
            }
        });

        if (result.items.length < 1000) break;
        else page++;
    }

    console.log('Total number of unique owners:', uniqueOwners.size);

    return {
        count: uniqueOwners.size,
        owners: Array.from(uniqueOwners) as string[],
        productView: productView,
        customerView: customerView,
    };
};
