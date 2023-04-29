import { twMerge } from "tailwind-merge";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

import { DefaultLayoutNavigationLink } from "./DefaultLayoutNavigationLink";
import { DefaultLayoutNavigationExternalLink } from "./DefaultLayoutNavigationExternalLink";
import { Help } from "./icons/Help";
import { RefundCount } from "./RefundCount";
import { Reply } from "./icons/Reply";
import { Description } from "./icons/Description";
import { SolanaPayMark } from "./SolanaPayMark";
import { Store } from "./icons/Store";
import { StoreStatusBadge, Status } from "./StoreStatusBadge";

interface Props {
  className?: string;
}

export function DefaultLayoutNavigation(props: Props) {
  return (
    <NavigationMenu.Root
      className={twMerge(
        "bg-white",
        "border-r",
        "border-slate-200",
        "bottom-0",
        "fixed",
        "flex-col",
        "flex",
        "h-full",
        "justify-between",
        "left-0",
        "max-w-xs",
        "px-6",
        "py-8",
        "top-0",
        "transition-transform",
        "w-[85%]",
        "z-10",
        "md:max-w-none",
        "md:w-auto",
        "md:bottom-auto",
        "md:left-auto",
        "md:relative",
        "md:top-auto",
        "md:translate-x-0",
        props.className
      )}
      orientation="vertical"
    >
      <NavigationMenu.List className="pr-6">
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <Link href="/">
              <SolanaPayMark className="h-7" />
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <div className="mt-16 pb-6 border-b border-slate-200">
          <div className="text-black font-semibold text-lg">[shopify id]</div>
          <StoreStatusBadge className="mt-2.5" status={Status.Inactive} />
        </div>
        <div className="mt-6">
          <DefaultLayoutNavigationLink
            href="/merchant"
            icon={<Store />}
            text="Merchant Info"
          />
          <DefaultLayoutNavigationLink
            href="/refund"
            icon={<Reply />}
            text="Refund"
            renderInRhs={<RefundCount />}
          />
        </div>
      </NavigationMenu.List>
      <NavigationMenu.List>
        <div className="pr-6">
          <DefaultLayoutNavigationExternalLink
            href="/docs"
            icon={<Description />}
            text="Documentation"
          />
          <DefaultLayoutNavigationExternalLink
            href="/support"
            icon={<Help />}
            text="Support"
          />
        </div>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
