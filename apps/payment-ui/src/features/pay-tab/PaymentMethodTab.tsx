import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from "../../store"
import { getPaymentMethod, PaymentMethod, setPaymentMethod } from "./paySlice"

export const PaymentMethodTab = () => {

    const dispatch = useDispatch<AppDispatch>()
    const paymentMethod = useSelector(getPaymentMethod)

    const paymentMethodTabOption = ( option: PaymentMethod, label: string ) => {

        const activeTabClassName = 'tab w-1/2 tab-active color-black drop-shadow'
        const defaultTabClassName = 'tab w-1/2'

        return (
            <a className={ paymentMethod == option ? activeTabClassName : defaultTabClassName } onClick={() => { dispatch(setPaymentMethod(option)) }}>{label}</a> 
        )
    }

    return (
        <div data-theme="mytheme" className="tabs tabs-boxed w-full rounded-xl bg-gray-200">
            {paymentMethodTabOption('connect-wallet', 'Pay with Wallet')}
            {paymentMethodTabOption('qr-code', 'Pay with QR Code')}
        </div>
    )
}