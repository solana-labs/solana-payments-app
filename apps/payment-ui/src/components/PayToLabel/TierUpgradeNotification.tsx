export const TierUpgradeNotification = (props: { nextTierName: string; nextTierDiscount: number }) => {
    return (
        <div className="flex flex-col items-start bg-green-50 border-l-4 border-green-400 p-2 rounded-md text-green-600 max-w-xs">
            <div className="font-semibold">
                <i className="fas fa-arrow-up"></i> Tier Upgrade Incoming: {props.nextTierName}
            </div>
            <div className="text-sm">New discount: {props.nextTierDiscount.toFixed(2)}%</div>
        </div>
    );
};
