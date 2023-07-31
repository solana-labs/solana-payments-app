interface Props {
    amount: number;
    tierName: string;
    percentage: number;
}
export const DiscountAmountDisplay = (props: Props) => {
    if (props.amount == 0) {
        return <></>;
    }
    return (
        <div className="flex flex-row w-full items-center justify-between">
            <div className="flex flex-row space-x-1">
                <div className="label-text text-green-600">{props.tierName}</div>
                <div className="label-text text-gray-600">Discount: {props.percentage}%</div>
            </div>
            <div className="label-text text-green-600 w-16 flex justify-center rounded-md h-8 items-center">
                ${props.amount.toFixed(2)}
            </div>
        </div>
    );
};

export const DiscountAmountLoading = () => {
    return (
        <div className="flex flex-row w-full items-center justify-between animate-pulse">
            <div className="label-text text-gray-600">Discount</div>
            <div className="rounded-md bg-gray-200 h-4 w-8 mr-4 mb-2" />
        </div>
    );
};
