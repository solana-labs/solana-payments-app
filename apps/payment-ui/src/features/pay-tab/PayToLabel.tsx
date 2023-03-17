import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from "../../store"
import { getPaymentMethod, PaymentMethod, setPaymentMethod } from "./paySlice"
import { MdArrowBack } from 'react-icons/md';

export const PayToLabel = () => {

    const dispatch = useDispatch<AppDispatch>()
    const paymentMethod = useSelector(getPaymentMethod)

    const paymentMethodTabOption = ( option: PaymentMethod, label: string ) => {

        const activeTabClassName = 'tab w-1/2 tab-active color-black data-theme="cupcake"'
        const defaultTabClassName = 'tab w-1/2'

        return (
            <a className={ paymentMethod == option ? activeTabClassName : defaultTabClassName } onClick={() => { dispatch(setPaymentMethod(option)) }}>{label}</a> 
        )
    }

    return (
        <div className="">
            <div className='flex flex-col justify-between h-44'>
                <div className="text-2xl text-black">Pay to Solana Mobile</div>
                <div className="text-5xl text-black">$949.00</div>
                <div className='flex flex-row w-full justify-between items-center'>
                    <div className="text-black text-lg w-1/3">-100.451 SOL</div>
                    <div className='flex flex-row justify-end items-center w-2/3'>
                        <div className='pr-2 text-md text-gray-600'>Pay with</div>
                        <select data-theme="mytheme" className="select select-bordered w-fit max-w-xs">
                            <option disabled selected>Currency</option>
                            <option>SOL</option>
                            <option>USDC</option>
                            <option>DUST</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="divider" /> 
            </div>
            <div className='flex flex-row w-full justify-between'>
                <div className="label-text">Cart</div>
                <div className="label-text">$14.95</div>
            </div>
            <div className='flex flex-row w-full justify-between'>
                <div className="label-text">Transaction Fee</div>
                <div className="label-text">Free</div>
            </div>
        </div>
    )
}