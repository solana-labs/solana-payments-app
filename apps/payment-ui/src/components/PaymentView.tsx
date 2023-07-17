import { PayToLabel } from '@/components/PayToLabel';
import { PaymentMethodTab } from '@/components/PaymentMethodTab';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import { useSelector } from 'react-redux';
import { QRCode } from './QRCode';

export const PaymentView: React.FC = () => {
    const paymentMethod = useSelector(getPaymentMethod);

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="w-full flex flex-col relative">
                <div className="relative pb-8 flex-col hidden sm:flex">
                    <PaymentMethodTab />
                </div>
                <PayToLabel />
            </div>
            {paymentMethod == 'qr-code' ? (
                <div className="w-full h-full flex flex-col items-center">
                    <div className="flex flex-col items-center">
                        <QRCode />
                        <div className="text-gray-600 text-xs pt-4">Scan this code to pay with your Solana wallet</div>
                    </div>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};
