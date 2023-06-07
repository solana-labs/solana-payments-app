import { twMerge } from 'tailwind-merge';
import { ArrowBack } from './icons/ArrowBack';
import { ArrowForward } from './icons/ArrowForward';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    direction: 'left' | 'right';
}

export function PaginatedTableArrowButton(props: Props) {
    const { className, direction, ...rest } = props;

    return (
        <button
            {...rest}
            className={twMerge(
                'border-gray-300',
                'border',
                'flex',
                'items-center',
                'p-2',
                'rounded-lg',
                'transition-all',
                'disabled:cursor-not-allowed',
                'disabled:opacity-50',
                'md:border-none',
                'md:p-0',
                className
            )}
        >
            {direction === 'left' && <ArrowBack className="h-5 fill-gray-700 w-5" />}
            {direction === 'left' && <div className="hidden ml-2 text-sm text-gray-700 md:block">Previous</div>}
            {direction === 'right' && <div className="hidden mr-2 text-sm text-gray-700 md:block">Next</div>}
            {direction === 'right' && <ArrowForward className="h-5 fill-gray-700 w-5" />}
        </button>
    );
}
