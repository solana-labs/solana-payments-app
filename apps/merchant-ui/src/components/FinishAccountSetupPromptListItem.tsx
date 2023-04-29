import { twMerge } from "tailwind-merge";

import { CheckmarkCircle } from "./icons/CheckmarkCircle";
import * as Button from "./Button";

interface Props {
  className?: string;
  completed?: boolean;
  title: string;
  onStart?(): void;
}

export function FinishAccountSetupPromptListItem(props: Props) {
  return (
    <div
      className={twMerge(
        "gap-x-3",
        "grid",
        props.completed
          ? "grid-cols-[max-content,1fr]"
          : "grid-cols-[1fr,max-content]",
        props.className
      )}
    >
      {props.completed && (
        <CheckmarkCircle className="fill-green-600 h-5 mt-1 w-5" />
      )}
      <div>
        <div className="text-black">{props.title}</div>
        <div className="text-sm text-neutral-600">
          {props.completed ? "Approved" : "Required"}
        </div>
      </div>
      {!props.completed && (
        <Button.Primary onClick={props.onStart}>Start</Button.Primary>
      )}
    </div>
  );
}
