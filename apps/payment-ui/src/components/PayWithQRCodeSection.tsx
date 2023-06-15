import { useSelector } from 'react-redux';
import { QRCode } from './QRCode';
import { SolanaPayState, getSolanaPayState } from '@/features/payment-session/paymentSessionSlice';

const PayWithQRCodeSection = () => {

    return (
        <div className="flex flex-col items-center justify-end pb-16 h-full">
            <QRCode />
        </div>
    );
};

export default PayWithQRCodeSection;
