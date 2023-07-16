import { twMerge } from 'tailwind-merge';
import { CoffeeMaker } from './icons/CoffeeMaker';

interface Props {
    className?: string;
}

export function PlaceholderLogo(props: Props) {
    return (
        <div
            className={twMerge(
                'bg-slate-50',
                'flex',
                'h-8',
                'items-center',
                'px-2',
                'py-1',
                'rounded-lg',
                props.className,
            )}
        >
            <CoffeeMaker className="fill-slate-800 h-6 mr-2 w-6" />
            <div className="font-bold text-black">My logo</div>
        </div>
    );
}
