export const PayAmountTokensDisplay = ( props: { displayAmoumt: string } ) => {
    return (
        <div className="text-black text-lg w-1/3">
            {props.displayAmoumt}
        </div>
    )
}

export const PayAmountTokensLoading = () => {
    return (
        <div className="animate-pulse flex items-center justify-start">
            <div className="rounded-full bg-gray-200 h-6 w-32" />
        </div>
    )
}