export const CartAmountDisplay = (props: { displayAmount: string }) => {
    return (
        <div className="label-text text-gray-600 w-16 flex justify-center rounded-md h-8 items-center">
            {props.displayAmount}
        </div>
    );
};

export const CartAmountLoading = () => {
    return (
        <div className="animate-pulse flex items-center justify-center">
            <div className="rounded-md bg-gray-200 h-4 w-8 mr-4 mb-2" />
        </div>
    );
};
