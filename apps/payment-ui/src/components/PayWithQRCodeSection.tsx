import { useSelector } from 'react-redux';
import { QRCode } from './QRCode';
import { SolanaPayState, getSolanaPayState } from '@/features/payment-session/paymentSessionSlice';

const PayWithQRCodeSection = () => {

    const solanaPayState = useSelector(getSolanaPayState)

    const classNameForStateAndStep = (state: SolanaPayState, step: number) => {
        return (state >= step ? 'step step-primary' : 'step') + ' align-text-top'
    }
    
    const contentForStateAndStep = (state: SolanaPayState, step: number) => {

        if ( state == step ) {
            return "●"
        } else if ( state < step ) {
            return step + 1
        } else {
            return "✓"
        }

    }

    const listItemForStateAndStep = (state: SolanaPayState, step: number, name: string) => {
        return (
            <li data-content={contentForStateAndStep(state, step)} className={classNameForStateAndStep(state, step)}>{name}</li>
        )
    }

    return (
        <div className="flex flex-col justify-start items-center mx-auto h-full w-full">
            <div className='h-[300]'>
                <QRCode />
            </div>
            <ul className="steps w-full mt-5">
                {listItemForStateAndStep(solanaPayState, 0, 'Scan QR Code')}
                {listItemForStateAndStep(solanaPayState, 1, 'It\'s loading!')}
                {listItemForStateAndStep(solanaPayState, 2, 'Send the Transaction')}
                {listItemForStateAndStep(solanaPayState, 3, 'Processing...')}
                {listItemForStateAndStep(solanaPayState, 4, 'You\'re done!')}
            </ul>
        </div>
    );
};

export default PayWithQRCodeSection;
