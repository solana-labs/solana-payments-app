import { twMerge } from "tailwind-merge";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

import { DefaultLayoutNavigationLink } from "./DefaultLayoutNavigationLink";
import { DefaultLayoutNavigationExternalLink } from "./DefaultLayoutNavigationExternalLink";
import { RefundCount } from "./RefundCount";
import { Reply } from "./icons/Reply";
import { Description } from "./icons/Description";
import { SolanaPayMark } from "./SolanaPayMark";
import { Store } from "./icons/Store";
import { ReceiptLong } from "./icons/ReceiptLong";
import { Flag } from "./icons/Flag";
import { Support } from "./icons/Support";

interface Props {
  accountIsActive?: boolean;
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
        </div>
        {props.accountIsActive ? (
          <div className="mt-6">
            <DefaultLayoutNavigationLink
              href="/transactions"
              icon={<ReceiptLong />}
              text="Transactions"
            />
            <DefaultLayoutNavigationLink
              href="/refunds"
              icon={<Reply />}
              text="Refunds"
              renderInRhs={<RefundCount />}
            />
            <DefaultLayoutNavigationLink
              href="/merchant"
              icon={<Store />}
              text="Merchant Info"
            />
            <DefaultLayoutNavigationLink
              href="/support"
              icon={<Support />}
              text="Support"
            />
          </div>
        ) : (
          <div className="mt-6">
            <DefaultLayoutNavigationLink
              href="/getting-started"
              icon={<Flag />}
              text="Getting Started"
            />
            <DefaultLayoutNavigationLink
              href="/support"
              icon={<Support />}
              text="Support"
            />
          </div>
        )}
      </NavigationMenu.List>
      <NavigationMenu.List>
        <div className="pr-6">
          <DefaultLayoutNavigationExternalLink
            href="/docs"
            icon={<Description />}
            text="Documentation"
          />
        </div>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
