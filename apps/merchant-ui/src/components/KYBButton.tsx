import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import dynamic from "next/dynamic";

import { Primary } from "./Button";
import { CheckmarkCircle } from "./icons/CheckmarkCircle";

const Inquiry = dynamic(() => import("persona").then((m) => m.Inquiry), {
  loading: () => <div />,
  ssr: false,
});

const PERSONA_HEIGHT = 800;
const PERSONA_WIDTH = 600;

interface Props {
  className?: string;
  isVerified?: boolean;
  onVerified?(): void;
}

export function KYBButton(props: Props) {
  const [open, setOpen] = useState(false);

  return props.isVerified ? (
    <div className="flex items-center">
      <div className="text-black text-sm font-semibold mr-2">Approved</div>
      <CheckmarkCircle className="h-5 fill-green-600 w-5" />
    </div>
  ) : (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Primary className={props.className}>Start</Primary>
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
          <Dialog.Content
            className="bg-white rounded-xl overflow-hidden"
            style={{ width: PERSONA_WIDTH, height: PERSONA_HEIGHT }}
          >
            <Inquiry
              templateId="itmpl_V3pKBU4ZkWXrrC3699domudP"
              environmentId="env_zgfWXWXgfPoDANKtnLraWC1V"
              frameWidth={PERSONA_WIDTH}
              frameHeight={PERSONA_HEIGHT}
              onComplete={({ inquiryId, status, fields }) => {
                props.onVerified?.();
                setOpen(false);
              }}
            />
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
