export const PaymentDoesNotExistView = () => {
    return (
        <div className="flex flex-col mt-8">
            <div className="text-2xl mx-auto">This order does not exist</div>
            <div className="text-sm text-gray-600 mx-auto pt-2">Please use an existing order</div>
        </div>
    );
};

export default PaymentDoesNotExistView;
