import { useSelector } from 'react-redux';
import { QRCode } from './QRCode';

const PayWithQRCodeSection = () => {
    return (
        <div className="flex flex-col items-center justify-end pb-16 h-full">
            <QRCode />
        </div>
    );
};

export default PayWithQRCodeSection;
