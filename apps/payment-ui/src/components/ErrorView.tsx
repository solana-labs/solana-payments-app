import { AppDispatch } from "@/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getError, removeError } from "@/features/error/errorSlice";

export const ErrorView = () => {

    const dispatch = useDispatch<AppDispatch>();
    const error = useSelector(getError);

    useEffect(() => {
        const interval = 3000; // 3 seconds

        const timer = setInterval(() => {
            dispatch(removeError());
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch]);


    return (
        <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{`Error: ${error}`}</span>
        </div>
    )
}