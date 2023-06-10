import { getPaymentId } from '../features/pay-tab/paySlice';
import QRCodeStyling from '@solana/qr-code-styling';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { createQROptions } from './SolanaPayQRCode';
import { buildPaymentTransactionRequestEndpoint } from '@/utility/endpoints.utility';
import { getPayingToken } from '@/features/payment-options/paymentOptionsSlice';

export const QRCode: FC = () => {
    const [size, setSize] = useState(() =>
        typeof window === 'undefined' ? 400 : Math.min(window.screen.availWidth - 48, 400)
    );
    const paymentId = useSelector(getPaymentId);

    useEffect(() => {
        const listener = () => setSize(Math.min(window.screen.availWidth - 48, 400));

        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, []);

    const payingToken = useSelector(getPayingToken);

    // TODO: make sure there is a payment id and if not show a different image than QR Code
    const endpoint = buildPaymentTransactionRequestEndpoint(paymentId ?? '');
    const url = `solana:${encodeURIComponent(endpoint)}`;
    const options = useMemo(() => createQROptions(url, size, 'transparent', 'black'), [url, size]);

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
