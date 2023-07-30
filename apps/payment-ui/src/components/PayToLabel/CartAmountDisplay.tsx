export const CartAmountDisplay = (props: { amount: number }) => {
    return (
        <div className="flex flex-row w-full items-center justify-between">
            <div className="label-text text-gray-600">Cart</div>
            <div className="label-text text-gray-600 w-16 flex justify-center rounded-md h-8 items-center">
                ${props.amount.toFixed(2)}
            </div>
        </div>
    );
};

export const CartAmountLoading = () => {
    return (
        <div className="flex flex-row w-full items-center justify-between animate-pulse">
            <div className="label-text text-gray-600">Cart</div>
            <div className="rounded-md bg-gray-200 h-4 w-8 mr-4 mb-2" />
        </div>
    );
};
