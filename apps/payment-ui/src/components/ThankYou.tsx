import Image from 'next/image'
import FinishHandler from './FinishHandler'

export const ThankYouView = () => {
    return (
        <div className="flex flex-col">
            <FinishHandler />
            <Image src="/check.svg" alt="Completed Payment" className="mx-auto w-16 h-16 mt-7 mb-4" width={10} height={10} />
            <div className="text-3xl text-black mx-auto">{"Thanks for your order."}</div>
            <div className="text-1xl text-gray-600 mx-auto pt-4">{"Your payment was successful."}</div>
            <div className="divider w-full" />
            <div className="text-sm text-gray-400 font-light mx-auto">{"We're redirecting you back to Shopify..."}</div>
        </div>
    )
}