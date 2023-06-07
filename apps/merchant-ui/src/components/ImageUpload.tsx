import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { twMerge } from 'tailwind-merge';
import { Cloud } from './icons/Cloud';

interface Props {
    className?: string;
    imageSrc?: string;
    onChange?(imageSrc: string): void;
}

export function ImageUpload(props: Props) {
    const onDrop = useCallback((images: File[]) => {
        const image = images[0];
        const reader = new FileReader();

        reader.onload = () => {
            const url = reader.result;

            if (typeof url === 'string') {
                props.onChange?.(url);
            }
        };

        reader.readAsDataURL(image);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': ['.png', '.svg', '.jpg', '.jpeg', '.gif'],
        },
    });
    const { className, ...rootProps } = getRootProps();

    return (
        <div className={props.className}>
            <div
                className={twMerge(
                    'border-gray-200',
                    'border',
                    'flex-col',
                    'flex',
                    'items-center',
                    'px-6',
                    'py-4',
                    'rounded-xl',
                    'transition-colors',
                    isDragActive && 'border-indigo-300',
                    className
                )}
                {...rootProps}
            >
                <input {...getInputProps()} />
                <div className="h-10 w-10 rounded-full bg-gray-50 grid place-items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 grid place-items-center">
                        <Cloud className="h-5 w-5 fill-gray-600" />
                    </div>
                </div>
                <div className="text-sm text-neutral-600 mt-3 text-center">
                    <span className="font-semibold text-indigo-700">Click to upload</span> or drag and drop
                </div>
                <div className="mt-1 text-xs text-neutral-600 text-center">SVG, PNG, JPG or GIF (max. 800x400px)</div>
            </div>
        </div>
    );
}
