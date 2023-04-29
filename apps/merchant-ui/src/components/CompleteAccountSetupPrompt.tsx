import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  percentComplete: number;
}

export function CompleteAccountSetupPrompt(props: Props) {
  return (
    <div
      className={twMerge(
        "bg-slate-50",
        "px-4",
        "py-6",
        "rounded-lg",
        props.className
      )}
    >
      <div
        className={twMerge(
          "bg-gray-200",
          "grid",
          "h-14",
          "place-items-center",
          "relative",
          "rounded-full",
          "w-14"
        )}
      >
        <div
          className={twMerge(
            "absolute",
            "bottom-0",
            "left-0",
            "right-0",
            "rounded-full",
            "top-0"
          )}
          style={{
            background: `conic-gradient(#16A34A 0%, #16A34A ${props.percentComplete}%, transparent ${props.percentComplete}%, transparent 100%)`,
          }}
        />
        <div
          className={twMerge(
            "grid",
            "place-items-center",
            "bg-slate-50",
            "font-medium",
            "h-12",
            "relative",
            "rounded-full",
            "text-slate-600",
            "text-sm",
            "w-12"
          )}
        >
          {props.percentComplete}%
        </div>
      </div>
      <div className="mt-5 text-black font-semibold">
        Complete your setup to go live
      </div>
      <div className="text-sm text-slate-600">
        You’re almost done! Finish setting up your account and go live.
      </div>
      <button className="mt-4 text-sm font-semibold text-indigo-600">
        Finish setup
      </button>
    </div>
  );
}
