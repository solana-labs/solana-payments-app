import { prisma } from '../../..'
import { Merchant, ShopifyAccess } from '@prisma/client'
import { getMerchant } from './merchant'

const getShopifyAccessTokenFromShop = async (shop: string) => {
    const shopifyAcess = await prisma.shopifyAccess.findFirst({
        where: {
            shop: shop,
        },
    })
}

const getShopifyAccessTokenFromMerchant = async (merchantPubkey: string) => {
    const merchant = await prisma.merchant.findFirst({
        where: {
            userPublicKey: merchantPubkey,
        },
    })
}

export const setShopifyAccessTokenForMerchant = async (
    merchantPubkey: string,
    token: string
) => {
    prisma.merchant.update({
        where: {
            userPublicKey: merchantPubkey,
        },
        data: {
            shopifyAccess: {
                update: {
                    accessToken: token,
                },
            },
        },
    })
}

export const setShopifyAccessTokenForShop = async (
    shop: string,
    token: string
) => {
    prisma.shopifyAccess.update({
        where: {
            shop: shop,
        },
        data: {
            accessToken: token,
        },
    })
}

export const setShopifyShopName = async (
    merchantPubkey: string,
    shop: string
) => {
    prisma.merchant.update({
        where: {
            userPublicKey: merchantPubkey,
        },
        data: {
            shopifyAccess: {
                update: {
                    shop: shop,
                },
            },
        },
    })
}

export const setShopifyScope = async (
    merchantPubkey: string,
    scope: string
) => {
    prisma.merchant.update({
        where: {
            userPublicKey: merchantPubkey,
        },
        data: {
            shopifyAccess: {
                update: {
                    scope: scope,
                },
            },
        },
    })
}

export const setShopifyLastNonceForMerchant = async (
    merchantPubkey: string,
    nonce: string
) => {
    prisma.merchant.update({
        where: {
            userPublicKey: merchantPubkey,
        },
        data: {
            shopifyAccess: {
                update: {
                    lastNonce: nonce,
                },
            },
        },
    })
}

export const setShopifyLastNonceForShop = async (
    shop: string,
    nonce: string
) => {
    prisma.shopifyAccess.update({
        where: {
            shop: shop,
        },
        data: {
            lastNonce: nonce,
        },
    })
}

export const shopifyAccessExists = async (shop: string): Promise<boolean> => {
    try {
        prisma.shopifyAccess.findUniqueOrThrow({
            where: {
                shop: shop,
            },
        })
    } catch {
        return false
    }

    return true
}
