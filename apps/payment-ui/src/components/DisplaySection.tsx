import Image from 'next/image';

const DisplaySection = () => {
    return (
        <div className="flex items-center justify-center h-16 py-2 w-full max-w-xl mx-auto">
            <Image src="/solana-pay.svg" alt="Solana Pay Logo" width={80} height={200} />
        </div>
    );
};

export default DisplaySection;
