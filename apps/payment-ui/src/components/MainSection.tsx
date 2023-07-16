import { useRouter } from 'next/router';
import CheckoutSection from './CheckoutSection';

const MainSection = () => {
    const router = useRouter();

    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col flex-auto border border-red-600">
            <div className="flex-grow container mx-auto bg-white rounded-t-2xl max-w-2xl px-4 sm:px-20">
                <CheckoutSection />
            </div>
        </div>
    );
};

export default MainSection;
