import { setBackendUrlEnv, setWebsocketUrlEnv } from "@/features/env/envSlice";
import { AppDispatch } from "@/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const EnvHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL

    console.log('backendUrl', backendUrl)
    console.log('websocketUrl', websocketUrl)

    useEffect(() => {
        dispatch(setBackendUrlEnv(backendUrl));
        dispatch(setWebsocketUrlEnv(websocketUrl));
    }, [dispatch, backendUrl, websocketUrl]);

    return null;
};

export default EnvHandler;
