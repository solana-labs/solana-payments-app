import { twMerge } from 'tailwind-merge';
import { useState } from 'react';
import Link from 'next/link';

import { Close } from './icons/Close';
import { Menu } from './icons/Menu';
import { SolanaPayMark } from './SolanaPayMark';
import { DefaultLayoutNavigation } from './DefaultLayoutNavigation';

interface Props {
    className?: string;
    children?: React.ReactNode;
    accountIsActive?: boolean;
}

export function DefaultLayout(props: Props) {
    const [navIsOpen, setNavIsOpen] = useState(false);

    return (
        <main className={twMerge('relative', 'md:grid', 'md:grid-cols-[312px,1fr]', props.className)}>
            <div
                className={twMerge(
                    'bg-black/10',
                    'bottom-0',
                    'fixed',
                    'hidden',
                    'left-0',
                    'right-0',
                    'top-0',
                    'z-10',
                    navIsOpen && 'block',
                    'md:hidden'
                )}
                onClick={() => setNavIsOpen(false)}
            />
            <DefaultLayoutNavigation
                accountIsActive={props.accountIsActive}
                className={navIsOpen ? 'translate-x-0' : '-translate-x-[100%]'}
            />
            <div
                className={twMerge(
                    'border-slate-200',
                    'border-b',
                    'flex',
                    'items-center',
                    'justify-between',
                    'px-3',
                    'py-5',
                    'md:hidden'
                )}
            >
                <Link href="/">
                    <SolanaPayMark className="h-6" />
                </Link>
                <button onClick={() => setNavIsOpen(cur => !cur)}>
                    {navIsOpen ? <Close className="fill-black h-6 w-6" /> : <Menu className="fill-black h-6 w-6" />}
                </button>
            </div>
            <div>{props.children}</div>
        </main>
    );
}
