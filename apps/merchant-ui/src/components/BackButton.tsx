import { useRouter } from "next/router";
import { twMerge } from "tailwind-merge";

import { KeyboardBackspace } from "./icons/KeyboardBackspace";

interface Props {
  className?: string;
}

export function BackButton(props: Props) {
  const router = useRouter();

  return (
    <button
      className={twMerge(
        "flex",
        "items-center",
        "space-x-2",
        "text-black",
        "fill-black",
        props.className
      )}
      onClick={() => router.back()}
    >
      <KeyboardBackspace className="h-6 w-6" />
      <div className="font-semibold">Go back</div>
    </button>
  );
}
