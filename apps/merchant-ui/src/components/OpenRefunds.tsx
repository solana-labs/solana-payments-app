import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import * as Dialog from "@radix-ui/react-dialog";

import { useMockOpenRefunds } from "@/hooks/useMockRefunds";
import * as RE from "@/lib/Result";
import { formatPrice } from "@/lib/formatPrice";
import * as Button from "./Button";
import { Close } from "./icons/Close";
import { abbreviateAddress } from "@/lib/abbreviateAddress";

interface Props {
  className?: string;
}

export function OpenRefunds(props: Props) {
  const openRefunds = useMockOpenRefunds();

  return (
    <div
      className={twMerge(
        "grid",
        "grid-cols-[1fr,repeat(4,max-content)]",
        props.className
      )}
    >
      {RE.match(
        openRefunds,
        () => (
          <div />
        ),
        () => (
          <div />
        ),
        (refunds) => (
          <>
            {[
              "Shopify Order #",
              "Requested On",
              "Requested Refund",
              "Purchase Amount",
              "Status",
            ].map((label, i) => (
              <div
                className={twMerge(
                  "border-b",
                  "border-gray-200",
                  "font-semibold",
                  "py-3",
                  "text-slate-600",
                  "text-sm",
                  i < 4 && "pr-14"
                )}
                key={label}
              >
                {label}
              </div>
            ))}
            {refunds.map((refund) => (
              <>
                <div
                  className={twMerge(
                    "border-b",
                    "border-gray-200",
                    "flex",
                    "font-semibold",
                    "h-20",
                    "items-center",
                    "text-black"
                  )}
                >
                  {refund.orderId}
                </div>
                <div
                  className={twMerge(
                    "border-b",
                    "border-gray-200",
                    "flex",
                    "h-20",
                    "items-center",
                    "text-black"
                  )}
                >
                  {format(refund.requestedOn, "MMM d, h:mmaaaaa")}
                </div>
                <div
                  className={twMerge(
                    "border-b",
                    "border-gray-200",
                    "flex",
                    "h-20",
                    "items-center",
                    "text-black"
                  )}
                >
                  {refund.requestedRefundAmount >= 0 ? "+" : "-"}$
                  {formatPrice(Math.abs(refund.requestedRefundAmount))}
                </div>
                <div
                  className={twMerge(
                    "border-b",
                    "border-gray-200",
                    "flex",
                    "h-20",
                    "items-center",
                    "text-black"
                  )}
                >
                  {refund.purchaseAmount >= 0 ? "+" : "-"}$
                  {formatPrice(Math.abs(refund.purchaseAmount))}
                </div>
                <div
                  className={twMerge(
                    "border-b",
                    "border-gray-200",
                    "flex",
                    "h-20",
                    "items-center",
                    "space-x-3"
                  )}
                >
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <Button.Secondary>Deny</Button.Secondary>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay
                        className={twMerge(
                          "bg-black/30",
                          "bottom-0",
                          "fixed",
                          "grid",
                          "left-0",
                          "place-items-center",
                          "right-0",
                          "top-0",
                          "z-10"
                        )}
                      >
                        <Dialog.Content className="bg-white rounded-xl overflow-hidden">
                          <div className="px-6 pt-6 pb-9">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-slate-900 text-2xl">
                                  Deny Refund
                                </div>
                                <div className="mt-2 text-slate-800">
                                  Are you sure? You can’t undo this action
                                  afterwards.
                                </div>
                              </div>
                              <Dialog.Close
                                className={twMerge(
                                  "bg-slate-100",
                                  "grid",
                                  "h-12",
                                  "ml-8",
                                  "place-items-center",
                                  "rounded-full",
                                  "w-12"
                                )}
                              >
                                <Close className="h-6 w-6 fill-black" />
                              </Dialog.Close>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 flex justify-end">
                            <Button.Primary>Deny Refund</Button.Primary>
                          </div>
                        </Dialog.Content>
                      </Dialog.Overlay>
                    </Dialog.Portal>
                  </Dialog.Root>
                  <Dialog.Root>
                    <Dialog.Trigger asChild>
                      <Button.Primary>Approve</Button.Primary>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                      <Dialog.Overlay
                        className={twMerge(
                          "bg-black/30",
                          "bottom-0",
                          "fixed",
                          "grid",
                          "left-0",
                          "place-items-center",
                          "right-0",
                          "top-0",
                          "z-10"
                        )}
                      >
                        <Dialog.Content className="bg-white rounded-xl overflow-hidden">
                          <div className="px-6 pt-6 pb-9">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-slate-900 text-2xl">
                                  Approve Refund
                                </div>
                                <div className="mt-2 text-slate-800">
                                  Connect your wallet and then approve the
                                  transaction.
                                </div>
                              </div>
                              <Dialog.Close
                                className={twMerge(
                                  "bg-slate-100",
                                  "grid",
                                  "h-12",
                                  "ml-8",
                                  "place-items-center",
                                  "rounded-full",
                                  "w-12"
                                )}
                              >
                                <Close className="h-6 w-6 fill-black" />
                              </Dialog.Close>
                            </div>
                            <div className="mt-9">
                              <div className="font-semibold text-sm text-slate-800">
                                Transaction Details:
                              </div>
                              <div className="grid grid-cols-[1fr,max-content] mt-4 gap-2.5 text-slate-800">
                                <div>Refund amount:</div>
                                <div className="font-semibold text-right">
                                  {refund.requestedRefundAmount >= 0
                                    ? "+"
                                    : "-"}
                                  $
                                  {formatPrice(
                                    Math.abs(refund.requestedRefundAmount)
                                  )}
                                </div>
                                <div>Refund to:</div>
                                <div className="font-semibold text-right">
                                  {abbreviateAddress(refund.refundTo)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 flex justify-end">
                            <Button.Primary>Approve with Wallet</Button.Primary>
                          </div>
                        </Dialog.Content>
                      </Dialog.Overlay>
                    </Dialog.Portal>
                  </Dialog.Root>
                </div>
              </>
            ))}
          </>
        )
      )}
    </div>
  );
}
