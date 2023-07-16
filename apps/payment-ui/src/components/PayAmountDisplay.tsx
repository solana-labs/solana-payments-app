export const PayAmountDisplay = (props: { displayAmoumt: string }) => {
    return <div className="text-5xl text-black">{props.displayAmoumt}</div>;
};

export const PayAmountLoading = () => {
    return (
        <div className="animate-pulse flex items-center justify-start">
            <div className="rounded-full bg-gray-200 h-10 w-64" />
        </div>
    );
};
