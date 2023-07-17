const FeePriceDisplayBase = (props: { showFree: boolean }) => {
    return (
        <div className="bg-gray-100 w-16 flex justify-center rounded-md h-8 items-center font-bold">
            {props.showFree ? 'Free' : ''}
        </div>
    );
};

export const FeePriceDisplay = () => {
    return <FeePriceDisplayBase showFree={true} />;
};

export const FeePriceDisplayLoading = () => {
    return (
        <div className="animate-pulse flex space-x-4">
            <FeePriceDisplayBase showFree={false} />
        </div>
    );
};
