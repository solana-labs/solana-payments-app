export enum TransactionStatus {
  Chargeback,
  Confirmed,
  Pending,
  RefundDenied,
  Refunded,
}

interface Transaction {
  address: string;
  amount: number;
  orderId: string;
  status: TransactionStatus;
  ts: number;
  user: string;
}

function mockTransactionStatus(index: number) {
  return [
    TransactionStatus.Chargeback,
    TransactionStatus.Confirmed,
    TransactionStatus.Pending,
    TransactionStatus.RefundDenied,
    TransactionStatus.Refunded,
  ][index % 5];
}

export function useMockTransactions(): Transaction[] {
  return Array.from({ length: 72 }).map((_, i) => ({
    address: `${i
      .toString()
      .padStart(2, "0")}3nryBDu2hqmpyAjssubxVda3Si1QAfA9yEAFAdV4TQ`,
    amount: -50 + i * 23.58,
    orderId: `123${i}`,
    status: mockTransactionStatus(i),
    ts: 1681336764686,
    user: "NR",
  }));
}
