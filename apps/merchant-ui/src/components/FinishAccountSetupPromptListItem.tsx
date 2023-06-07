import { twMerge } from 'tailwind-merge';

import { CheckmarkCircle } from './icons/CheckmarkCircle';
import * as Button from './Button';
import { cloneElement } from 'react';

interface Props {
    additionalText?: string;
    className?: string;
    completed?: boolean;
    icon: JSX.Element;
    title: string;
    renderTrigger: (props: Omit<Props, 'renderTrigger'>) => JSX.Element;
    onStart?(): void;
}

interface IconProps {
    icon: JSX.Element;
    size: number | string; // Accept the size you want to pass to the icon
    color: string;
}

const IconWrapper: React.FC<IconProps> = ({ icon, size, color }) => {
    return cloneElement(icon, { size, fill: color }); // clone the icon and set its size
};

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
            {/* <img src={props.img} > */}
            <div className="bg-indigo-100 h-10 overflow-hidden w-10 rounded-full flex items-center justify-center">
                <IconWrapper icon={props.icon} size={24} color="#4F46E5" />
            </div>
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
