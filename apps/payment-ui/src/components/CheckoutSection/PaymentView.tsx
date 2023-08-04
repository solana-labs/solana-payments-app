import { QRCode } from '@/components/CheckoutSection/QRCode';
import { PayToLabel } from '@/components/PayToLabel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPaymentMethod, setPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';

export const PaymentView: React.FC = () => {
    const paymentMethod = useSelector(getPaymentMethod);
    const dispatch = useDispatch<AppDispatch>();

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="w-full flex flex-col relative">
                <Tabs defaultValue="connect-wallet" className="pb-8 hidden sm:flex w-full">
                    <TabsList className="w-full">
                        <TabsTrigger
                            value="connect-wallet"
                            className="w-1/2"
                            onClick={() => dispatch(setPaymentMethod('connect-wallet'))}
                        >
                            Pay with Wallet
                        </TabsTrigger>
                        <TabsTrigger
                            value="qr-code"
                            className="w-1/2"
                            onClick={() => dispatch(setPaymentMethod('qr-code'))}
                        >
                            Pay with QR Code
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <PayToLabel />
            </div>
            {paymentMethod == 'qr-code' && (
                <div className="w-full h-full flex flex-col items-center">
                    <div className="flex flex-col items-center">
                        <QRCode />
                        <p className="text-gray-600 text-xs pt-4">Scan this code to pay with your Solana wallet</p>
                    </div>
                </div>
            )}
        </div>
    );
};
