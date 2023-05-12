import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

export function DefaultLayoutContent(props: Props) {
    return (
        <article className={twMerge('px-4', 'py-8', 'md:pl-16', 'md:pr-24', 'md:pt-32', props.className)}>
            {props.children}
        </article>
    );
}
