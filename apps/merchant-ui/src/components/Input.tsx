import { twMerge } from 'tailwind-merge';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: Props) {
    const { className, ...rest } = props;

    return (
        <input
            {...rest}
            className={twMerge(
                'border-gray-300',
                'border',
                'h-11',
                'px-4',
                'rounded-lg',
                'text-slate-800',
                rest.disabled && 'bg-gray-100',
                rest.disabled && 'cursor-not-allowed',
                className
            )}
        />
    );
}
