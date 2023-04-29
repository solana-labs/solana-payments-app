import { cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

interface Props {
  className?: string;
  href: string;
  icon: JSX.Element;
  text: string;
  renderInRhs?: JSX.Element;
}

export function DefaultLayoutNavigationLink(props: Props) {
  const router = useRouter();
  const isSelected = router.asPath.startsWith(props.href);

  return (
    <NavigationMenu.Item>
      <NavigationMenu.Link asChild>
        <Link
          className={twMerge(
            "gap-x-4",
            "gap-x-3",
            "grid",
            "items-center",
            "px-3",
            "py-2",
            "rounded-md",
            "transition-colors",
            "hover:bg-slate-50",
            props.renderInRhs
              ? "grid-cols-[24px,1fr,max-content]"
              : "grid-cols-[24px,1fr]"
          )}
          href={props.href}
        >
          {cloneElement(props.icon, {
            className: twMerge(
              "fill-slate-400",
              "h-6",
              "transition-colors",
              "w-6",
              isSelected && "fill-indigo-600",
              props.icon.props.className
            ),
          })}
          <div
            className={twMerge("transition-all", isSelected && "font-semibold")}
          >
            {props.text}
          </div>
          {props.renderInRhs && <div>{props.renderInRhs}</div>}
        </Link>
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}
