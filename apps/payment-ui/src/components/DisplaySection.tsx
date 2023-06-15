import { MdArrowBack } from 'react-icons/md';
import Image from 'next/image';
import { getPaymentDetails } from '@/features/payment-session/paymentSessionSlice';
import { useSelector } from 'react-redux';

const DisplaySection = () => {
    const paymentDetails = useSelector(getPaymentDetails);

    return (
        <div className="grid grid-cols-3 w-full max-w-xl">
            <div className="flex flex-row">
                <button
                    className="btn btn-ghost z-10"
                    onClick={() => {
                        if (paymentDetails?.cancelUrl != null) {
                            window.location.href = paymentDetails.cancelUrl;
                        }
                    }}
                >
                    <MdArrowBack color="white" size={30} />
                </button>
            </div>
            <div className="flex flex-col mx-auto my-auto">
                <Image src="/solana-pay.svg" alt="Solana Pay Logo" width={80} height={200} />
            </div>
            <div className="flex flex-col"></div>
        </div>
    );
};

export default DisplaySection;
