import { DefaultLayout } from '@/components/DefaultLayout';

export default function Home() {
    return (
        <DefaultLayout>
            <div className="flex flex-col  h-full">
                <h1 className="text-4xl font-bold mb-4">Welcome to SolanaPay</h1>
                <p className="text-lg mb-4">Checkout from Shopify using SolanaPay</p>
                <p className="text-lg mb-8">Earn Rewards from your crypto payments</p>
            </div>
        </DefaultLayout>
    );
}
