import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  children?: string;
}

export function DefaultLayoutScreenTitle(props: Props) {
  return (
    <h1
      className={twMerge(
        "font-semibold",
        "text-3xl",
        "text-black",
        "md:text-5xl",
        props.className
      )}
    >
      {props.children}
    </h1>
  );
}
