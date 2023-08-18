export default function EnvLabel() {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'production') {
        return null;
    }
    return (
        <div className="bg-red-500 text-white text-xs font-bold p-1 text-center">
            {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && 'Development'}
            {process.env.NEXT_PUBLIC_NODE_ENV === 'staging' && 'Staging'}
        </div>
    );
}
