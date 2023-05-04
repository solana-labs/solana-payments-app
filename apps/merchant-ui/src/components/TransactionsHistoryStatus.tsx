import { twMerge } from "tailwind-merge";

import { TransactionStatus } from "@/hooks/useMockTransactions";

function getText(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "Chargeback";
    case TransactionStatus.Completed:
      return "Completed";
    case TransactionStatus.Pending:
      return "Pending";
    case TransactionStatus.RefundDenied:
      return "Refund Denied";
    case TransactionStatus.RefundRequested:
      return "Refund Requested";
    case TransactionStatus.Refunded:
      return "Refunded";
  }
}

function getBorder(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "border-red-800";
    case TransactionStatus.Completed:
      return "border-emerald-800";
    case TransactionStatus.Pending:
      return "border-emerald-800";
    case TransactionStatus.RefundDenied:
      return "border-orange-800";
    case TransactionStatus.RefundRequested:
      return "border-amber-700";
    case TransactionStatus.Refunded:
      return "border-slate-800";
  }
}

function getBgColor(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "bg-red-100";
    case TransactionStatus.Completed:
      return "bg-emerald-100";
    case TransactionStatus.Pending:
      return "bg-transparent";
    case TransactionStatus.RefundDenied:
      return "bg-orange-100";
    case TransactionStatus.RefundRequested:
      return "bg-amber-50";
    case TransactionStatus.Refunded:
      return "bg-slate-100";
  }
}

function getTextColor(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.Chargeback:
      return "text-red-800";
    case TransactionStatus.Completed:
      return "text-emerald-800";
    case TransactionStatus.Pending:
      return "text-emerald-800";
    case TransactionStatus.RefundDenied:
      return "text-orange-800";
    case TransactionStatus.RefundRequested:
      return "text-amber-700";
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
        "text-sm",
        "border",
        "px-3",
        "py-1",
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
