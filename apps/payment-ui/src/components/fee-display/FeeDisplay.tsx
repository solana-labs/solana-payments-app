const FeeDisplayBase = ( props: { showFree: boolean } ) => {
    return (
        <div className="text-black bg-gray-200 w-16 flex justify-center rounded-md h-8 items-center font-bold">
            { props.showFree ? 'Free' : '' }
        </div>
    )
}

export const FeeDisplay = ( ) => {
    return (
        <FeeDisplayBase showFree={true} />
    )
}

export const FeeDisplayLoading = ( ) => {
    return (
        <div className="animate-pulse flex space-x-4">
            <FeeDisplayBase showFree={false} />
        </div>
    )
}