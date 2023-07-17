import { BiInfoCircle } from 'react-icons/bi';

const FeePriceDisplayBase = (props: { showFree: boolean }) => {
    return (
        <div className="bg-gray-100 w-16 flex justify-center rounded-md h-8 items-center font-bold">
            {props.showFree ? 'Free' : ''}
        </div>
    );
};

export const FeePriceDisplay = () => {
    return (
        <div className="flex flex-row w-full items-center justify-between">
            <label tabIndex={0} htmlFor="fee-detail-modal">
                <div className="flex flex-row justify-center items-center">
                    <div className="label-text text-gray-600">Transaction Fee</div>
                    <BiInfoCircle className="text-sm ml-2 label-text text-gray-600" />
                </div>
            </label>
            <FeePriceDisplayBase showFree={true} />
            <TransactionFeeModal />
        </div>
    );
};

export const FeePriceDisplayLoading = () => {
    return (
        <div className="flex flex-row w-full items-center justify-between animate-pulse">
            <div className="label-text text-gray-600">Transaction Fee</div>
            <FeePriceDisplayBase showFree={false} />
            <TransactionFeeModal />
        </div>
    );
};

const TransactionFeeModal = () => (
    <>
        <input type="checkbox" id="fee-detail-modal" className="modal-toggle" />
        <div id="fee-detail-modal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box bg-white">
                <div className="flex flex-col h-full items-start justify-center">
                    <div className="modal-action">
                        <label
                            htmlFor="fee-detail-modal"
                            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-900 bg-gray-200"
                        >
                            ✕
                        </label>
                    </div>
                    <div className="text-xl font-semibold mb-2">Transaction Fee</div>
                    <div className="text-gray-600">
                        Solana Pay covers the transaction fee so that all you need is USDC to complete your transaction.
                        Your wallet may still show this as part of your transaction.
                    </div>
                </div>
            </div>
            <label className="modal-backdrop" htmlFor="fee-detail-modal">
                Close
            </label>
        </div>
    </>
);
