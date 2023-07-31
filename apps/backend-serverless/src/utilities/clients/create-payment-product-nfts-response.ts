import { PaymentRecord, PrismaClient, Product } from '@prisma/client';
import { CheckoutService } from '../../services/database/checkout-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';

interface PaymentProductNftsResponse {
    products: Product[];
}

export const createPaymentProductNftsResponse = async (
    paymentRecord: PaymentRecord,
    merchantService: MerchantService
): Promise<PaymentProductNftsResponse> => {
    const prisma = new PrismaClient();
    const checkoutService = new CheckoutService(prisma);

    let products: Product[] = [];
    let productIds = await checkoutService.getProductsInCheckout(paymentRecord.cancelURL.split('/').pop()!);
    products = await merchantService.getProductsByIds(productIds);

    return { products: products.filter(product => product.active) };
};
