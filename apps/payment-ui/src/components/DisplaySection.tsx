import { MdArrowBack } from 'react-icons/md';
import Image from 'next/image';
import { getPaymentDetails } from '@/features/pay-tab/paySlice';
import { useSelector } from 'react-redux';

const DisplaySection = () => {

    const paymentDetails = useSelector(getPaymentDetails);

    return (
        <div className="flex flex-row w-full sm:h-[5vh] h-[10vh]">
            <div className="w-full relative flex flex-row items-center justify-center">
                <div className="absolute flex flex-row justify-start w-full sm:px-8 px-4">
                <button
                    className="btn btn-ghost z-10"
                    onClick={() => {
                        if ( paymentDetails?.cancelUrl != null ) {
                            window.location.href = paymentDetails.cancelUrl;
                        }
                    }}
                >
                    <MdArrowBack color="white" size={30} />
                </button>
                </div>
                <div className="absolute flex flex-row justify-center w-full">
                    <Image src="/solana-pay.svg" alt="Solana Pay Logo" width={80} height={200} />
                </div>
            </div>
        </div>
    );
};

export default DisplaySection;
