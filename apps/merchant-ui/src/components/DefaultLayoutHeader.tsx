import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
    children: string;
}

export function DefaultLayoutHeader(props: Props) {
    return <div className={twMerge('font-semibold', 'pb-2', 'text-2xl', props.className)}>{props.children}</div>;
}
