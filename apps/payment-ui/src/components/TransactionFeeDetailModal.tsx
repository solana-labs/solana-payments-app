const TransactionFeeDetailModal = () => {
    return (
        <div className="w-full">
            <label tabIndex={0} className="text-black" htmlFor="fee-detail-modal">
                Hello World
            </label>
            <input type="checkbox" id="fee-detail-modal" className="modal-toggle" />
            <div id="fee-detail-modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white">
                    <div className='flex flex-col h-full items-start justify-center'>
                        <div className="modal-action">
                            <label htmlFor="fee-detail-modal" className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-900 bg-gray-200">✕</label>
                        </div>
                        <div className='text-black text-xl font-semibold mb-2'>
                            Transaction Fee
                        </div>
                        <div className='text-gray-600'>
                            Solana Pay covers the transaction fee so that all you need is USDC to complete your transaction. Your wallet may still show  this as part of your transaction.
                        </div>
                    </div>
                </div>
                <label className="modal-backdrop" htmlFor="fee-detail-modal">Close</label>
            </div>
        </div>
    );
}

export default TransactionFeeDetailModal;