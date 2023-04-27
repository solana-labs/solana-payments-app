import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface Props {
  className?: string;
}

export function WelcomeHero(props: Props) {
  return (
    <Image
      className={twMerge("bg-neutral-50", props.className)}
      src=""
      alt="Welcome to Solana Pay"
    />
  );
}
