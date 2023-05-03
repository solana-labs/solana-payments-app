import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../store";
import {
  getPayingToken,
  getPaymentDetails,
  getPaymentMethod,
  PaymentMethod,
  setPaymentMethod,
} from "./paySlice";
import { MdArrowBack } from "react-icons/md";
import PaymentTokenSelector from "@/components/PaymentTokenSelector";
import { convertToDollarString } from "@/utility";

export const PayToLabel = () => {
  const dispatch = useDispatch<AppDispatch>();
  const payingToken = useSelector(getPayingToken);
  const paymentMethod = useSelector(getPaymentMethod);
  const paymentDetails = useSelector(getPaymentDetails);

  const paymentMethodTabOption = (option: PaymentMethod, label: string) => {
    const activeTabClassName =
      'tab w-1/2 tab-active color-black data-theme="cupcake"';
    const defaultTabClassName = "tab w-1/2";

    return (
      <a
        className={
          paymentMethod == option ? activeTabClassName : defaultTabClassName
        }
        onClick={() => {
          dispatch(setPaymentMethod(option));
        }}
      >
        {label}
      </a>
    );
  };

  return (
    <div className="">
      <div className="flex flex-col justify-between h-44">
        <div className="text-2xl text-black">
          {"Pay to " + paymentDetails.merchantDisplayName}
        </div>
        <div className="text-5xl text-black">
          {paymentDetails.totalAmountFiatDisplay}  
        </div>
        <div className="flex flex-row w-full justify-between items-center">
          <div className="text-black text-lg w-1/3">{paymentDetails.totalAmountUSDCDisplay}  </div>
          <div className="w-2/3">
            <PaymentTokenSelector />
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <div className="divider" />
      </div>
      <div className="flex flex-row w-full justify-between">
        <div className="label-text">Cart</div>
        <div className="text-gray-500 w-16 flex justify-center rounded-md h-8 items-center">
          {paymentDetails.totalAmountFiatDisplay}
        </div>
      </div>
      <div className="flex flex-row w-full justify-between">
        <div className="label-text">Transaction Fee</div>
        <div className="text-black bg-gray-200 w-16 flex justify-center rounded-md h-8 items-center font-bold">
          Free
        </div>
      </div>
    </div>
  );
};
