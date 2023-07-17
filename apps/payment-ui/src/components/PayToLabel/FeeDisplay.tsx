import { BiInfoCircle } from 'react-icons/bi';

const TransactionFeeLabel = () => (
    <div className="flex flex-row justify-center items-center">
        <div className="label-text text-gray-600">Transaction Fee</div>
        <BiInfoCircle className="text-sm ml-2 label-text text-gray-600" />
    </div>
);

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

const FeePriceDisplayBase = ({ showFree }: { showFree: boolean }) => (
    <div className="bg-gray-100 w-16 flex justify-center rounded-md h-8 items-center font-bold">
        {showFree ? 'Free' : ''}
    </div>
);

export const FeePriceDisplay = () => (
    <div className="flex flex-row w-full items-center justify-between">
        <TransactionFeeLabel />
        <FeePriceDisplayBase showFree={true} />
        <TransactionFeeModal />
    </div>
);

export const FeePriceDisplayLoading = () => (
    <div className="flex flex-row w-full items-center justify-between animate-pulse">
        <TransactionFeeLabel />
        <FeePriceDisplayBase showFree={false} />
    </div>
);
