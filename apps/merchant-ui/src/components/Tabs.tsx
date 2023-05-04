import { twMerge } from "tailwind-merge";
import * as Tabs from "@radix-ui/react-tabs";

export const Root = Tabs.Root;
export const Content = Tabs.Content;

export function List(props: Tabs.TabsListProps) {
  return (
    <Tabs.List
      {...props}
      className={twMerge(
        "border-b-[2px]",
        "border-primary-200",
        "flex",
        "items-center",
        "space-x-4",
        props.className
      )}
    />
  );
}

export function Trigger(props: Tabs.TabsTriggerProps) {
  return (
    <Tabs.Trigger
      {...props}
      className={twMerge(
        "-mb-[2px]",
        "px-6",
        "py-2",
        "text-slate-500",
        "border-b-[2px]",
        "border-transparent",
        "font-medium",
        'data-[state="active"]:border-indigo-600',
        'data-[state="active"]:text-indigo-600',
        'data-[state="active"]:font-semibold',
        props.className
      )}
    />
  );
}
