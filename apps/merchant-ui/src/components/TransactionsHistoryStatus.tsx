import { twMerge } from "tailwind-merge";

import { TransactionStatus } from "@/hooks/useMockTransactions";

function getText(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "Chargeback";
    case TransactionStatus.Confirmed:
      return "Confirmed";
    case TransactionStatus.Pending:
      return "Pending";
    case TransactionStatus.RefundDenied:
      return "Refund Denied";
    case TransactionStatus.Refunded:
      return "Refunded";
  }
}

function getBorder(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Pending:
      return "border-emerald-800";
    default:
      return "border-transparent";
  }
}

function getBgColor(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "bg-red-100";
    case TransactionStatus.Confirmed:
      return "bg-emerald-100";
    case TransactionStatus.Pending:
      return "bg-transparent";
    case TransactionStatus.RefundDenied:
      return "bg-orange-100";
    case TransactionStatus.Refunded:
      return "bg-slate-100";
  }
}

function getTextColor(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "text-red-800";
    case TransactionStatus.Confirmed:
      return "text-emerald-800";
    case TransactionStatus.Pending:
      return "text-emerald-800";
    case TransactionStatus.RefundDenied:
      return "text-orange-800";
    case TransactionStatus.Refunded:
      return "text-slate-800";
  }
}

interface Props {
  className?: string;
  status: TransactionStatus;
}

export function TransactionsHistoryStatus(props: Props) {
  return (
    <div
      className={twMerge(
        "text-xs",
        "border",
        "px-1.5",
        "py-0.5",
        "rounded-2xl",
        getBorder(props.status),
        getBgColor(props.status),
        getTextColor(props.status),
        props.className
      )}
    >
      {getText(props.status)}
    </div>
  );
}
