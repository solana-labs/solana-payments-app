export const PayToDisplay = (props: { merchantName: string }) => {
    return <div className="text-2xl text-black">{'Pay to ' + props.merchantName}</div>;
};

export const PayToLoading = () => {
    return (
        <div className="animate-pulse flex items-center justify-start">
            <div className="rounded-full bg-gray-200 h-6 w-44" />
        </div>
    );
};
