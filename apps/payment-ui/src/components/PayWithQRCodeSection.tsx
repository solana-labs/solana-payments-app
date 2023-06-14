import { useSelector } from 'react-redux';
import { QRCode } from './QRCode';
import { SolanaPayState, getSolanaPayState } from '@/features/payment-session/paymentSessionSlice';

const PayWithQRCodeSection = () => {

    return (
        <div className="flex flex-col justify-start items-center mx-auto h-full w-full">
            <div className='h-[300]'>
                <QRCode />
            </div>
        </div>
    );
};

export default PayWithQRCodeSection;
