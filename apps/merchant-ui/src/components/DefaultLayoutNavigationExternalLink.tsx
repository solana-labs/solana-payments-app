import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cloneElement } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
    href: string;
    icon: JSX.Element;
    text: string;
}

export function DefaultLayoutNavigationExternalLink(props: Props) {
    return (
        <NavigationMenu.Item>
            <NavigationMenu.Link
                className={twMerge(
                    'gap-x-3',
                    'group',
                    'grid-cols-[24px,1fr,max-content]',
                    'grid',
                    'items-center',
                    'px-3',
                    'py-2',
                    'rounded-md',
                    'transition-colors',
                )}
                href={props.href}
                target="_blank"
            >
                {cloneElement(props.icon, {
                    className: twMerge('fill-slate-400', 'h-6', 'transition-colors', 'w-6', props.icon.props.className),
                })}
                <div className="transition-all group-hover:font-semibold">{props.text}</div>
                {/* <OpenInNew className="fill-indigo-500 h-6 w-6" /> */}
            </NavigationMenu.Link>
        </NavigationMenu.Item>
    );
}
