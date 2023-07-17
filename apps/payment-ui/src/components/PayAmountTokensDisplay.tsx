import PaymentTokenSelector from '@/components/PaymentTokenSelector';

export const PayAmountTokensDisplay = (props: { displayAmoumt: string }) => {
    return (
        <div className="flex flex-row w-full justify-between items-center">
            <div className="text-lg w-1/3">{props.displayAmoumt}</div>
            <div className="w-2/3">
                <PaymentTokenSelector />
            </div>
        </div>
    );
};

export const PayAmountTokensLoading = () => {
    return (
        <div className="flex flex-row w-full justify-between items-center animate-pulse">
            <div className="rounded-full bg-gray-200 h-6 w-32" />
            <div className="w-2/3">
                <PaymentTokenSelector />
            </div>
        </div>
    );
};
