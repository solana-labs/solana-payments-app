import * as Accordion from '@radix-ui/react-accordion';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { ArrowDropDownCircle } from './icons/ArrowDropDownCircle';

interface QA {
    question: string;
    answer: string;
}

interface Props {
    className?: string;
    qas: QA[];
    title: string;
}

export function FAQ(props: Props) {
    const [open, setOpen] = useState<string[]>([]);

    return (
        <div className={props.className}>
            <div className="font-semibold text-2xl text-black mb-6">{props.title}</div>
            <Accordion.Root className="border-b border-gray-200" type="multiple" value={open} onValueChange={setOpen}>
                {props.qas.map((qa, i) => (
                    <Accordion.Item className="py-9 border-t border-gray-200" key={i} value={qa.question}>
                        <Accordion.Header>
                            <Accordion.Trigger className="flex items-center justify-between w-full">
                                <div className="text-black text-lg font-medium">{qa.question}</div>
                                <ArrowDropDownCircle
                                    className={twMerge(
                                        'fill-black',
                                        'h-6',
                                        'w-6',
                                        'transition-transform',
                                        open.includes(qa.question) && '-rotate-180',
                                    )}
                                />
                            </Accordion.Trigger>
                        </Accordion.Header>
                        <Accordion.Content className="text-black mt-3">{qa.answer}</Accordion.Content>
                    </Accordion.Item>
                ))}
            </Accordion.Root>
        </div>
    );
}
