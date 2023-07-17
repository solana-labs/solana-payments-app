import { getPaymentId } from '@/features/payment-details/paymentDetailsSlice';
import { buildTransactionRequestEndpoint } from '@/utility/endpoints.utility';
import QRCodeStyling from '@solana/qr-code-styling';
import { FC, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { createQROptions } from '../SolanaPayQRCode';

export const QRCode: FC = () => {
    const paymentId = useSelector(getPaymentId);

    // TODO: make sure there is a payment id and if not show a different image than QR Code
    const endpoint = buildTransactionRequestEndpoint(paymentId ?? '');
    const url = `solana:${encodeURIComponent(endpoint)}`;
    const options = useMemo(() => createQROptions(url, 200, 'transparent', 'black'), [url, 200]);

    const qr = useMemo(() => new QRCodeStyling(), []);
    useEffect(() => qr.update(options), [qr, options]);

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) {
            qr.append(ref.current);
        }

        // Add this return function to clean up the effect
        return () => {
            if (ref.current) {
                ref.current.innerHTML = '';
            }
        };
    }, [ref, qr]);

    return <div ref={ref} />;
};
