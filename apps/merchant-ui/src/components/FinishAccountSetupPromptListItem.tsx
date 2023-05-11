import { twMerge } from 'tailwind-merge';

import { CheckmarkCircle } from './icons/CheckmarkCircle';
import * as Button from './Button';

interface Props {
    additionalText?: string;
    className?: string;
    completed?: boolean;
    img: string;
    title: string;
    renderTrigger: (props: Omit<Props, 'renderTrigger'>) => JSX.Element;
    onStart?(): void;
}

export function FinishAccountSetupPromptListItem(props: Props) {
    return (
        <div
            className={twMerge(
                'gap-x-5',
                'grid',
                'grid-cols-[max-content,1fr,max-content]',
                'items-center',
                props.className
            )}
        >
            <img src={props.img} className="bg-slate-200 h-10 overflow-hidden w-10 rounded-full" />
            <div className="text-black">{props.title}</div>
            <div className="flex items-center space-x-6">
                {props.completed ? (
                    <div />
                ) : (
                    <div className="font-semibold text-black text-sm">
                        Required{props.additionalText && ` ${props.additionalText}`}
                    </div>
                )}
                {props.completed ? (
                    <div
                        className={twMerge(
                            'fill-emerald-700',
                            'flex',
                            'font-semibold',
                            'items-center',
                            'space-x-2.5',
                            'text-emerald-700',
                            'text-sm'
                        )}
                    >
                        <div>Complete</div>
                        <CheckmarkCircle className="h-5 w-5" />
                    </div>
                ) : (
                    props.renderTrigger(props)
                )}
            </div>
        </div>
    );
}

FinishAccountSetupPromptListItem.defaultProps = {
    renderTrigger: (props: Omit<Props, 'renderTrigger'>) => (
        <Button.Primary onClick={props.onStart}>Start</Button.Primary>
    ),
};
