import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import Image from 'next/image';
import { MdArrowBack } from 'react-icons/md';
import { useSelector } from 'react-redux';

const DisplaySection = () => {
    const paymentDetails = useSelector(getPaymentDetails);

    const handleBackButtonClick = () => {
        if (paymentDetails?.cancelUrl) {
            window.location.href = paymentDetails.cancelUrl;
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="container mx-auto">
                <div className="grid grid-cols-3 h-16 py-2 font-black text-white text-2xl">
                    <button className="btn btn-ghost z-10" onClick={handleBackButtonClick}>
                        <MdArrowBack color="white" size={30} />
                    </button>
                    <div className="flex flex-col mx-auto my-auto">
                        <Image src="/solana-pay.svg" alt="Solana Pay Logo" width={80} height={200} />
                    </div>
                    <div />
                </div>
            </div>
        </div>
    );
};

export default DisplaySection;
