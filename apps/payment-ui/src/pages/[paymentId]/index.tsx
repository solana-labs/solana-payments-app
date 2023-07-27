import CheckoutSection from '@/components/CheckoutSection';
import { DefaultLayout } from '@/components/DefaultLayout';
import { useRouter } from 'next/router';

export default function CheckoutPage() {
    const router = useRouter();

    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <DefaultLayout>
            <CheckoutSection />
        </DefaultLayout>
    );
}
