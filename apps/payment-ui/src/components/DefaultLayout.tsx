import DisplaySection from '@/components/DisplaySection';

interface Props {
    className?: string;
    children?: React.ReactNode;
}

export function DefaultLayout(props: Props) {
    return (
        <main className="flex flex-col h-screen bg-black">
            <DisplaySection />
            <div className="flex flex-col flex-auto container mx-auto bg-white rounded-t-2xl max-w-2xl px-4 sm:px-20">
                {props.children}
            </div>
        </main>
    );
}
