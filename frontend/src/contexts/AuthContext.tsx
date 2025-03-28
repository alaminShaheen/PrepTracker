"use client";

import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import { auth } from "@/firebaseConfig";
import { ROUTES } from "@/constants/Routes";
import { addAxiosAuthHeader } from "@/lib/axiosInstance";

type AuthContextType = {
    appLoading: boolean;
    user: User | null;
    authenticated: boolean;
    onUserLogin: (user: User) => Promise<void>;
    subscribedToEmails?: boolean;
    setSubscribedToEmails: Dispatch<SetStateAction<boolean | undefined>>;
};

const APP_CONTEXT_DEFAULT_VALUES: AuthContextType = {
    appLoading: false,
    user: null,
    authenticated: false,
    subscribedToEmails: undefined,
    onUserLogin: async () => {
    },
    setSubscribedToEmails: () => {},
};
export const AuthContext = createContext<AuthContextType>(APP_CONTEXT_DEFAULT_VALUES);

type AppContextProviderProps = {
    children: ReactNode;
};

export const AuthContextProvider = (props: AppContextProviderProps) => {
    const { children } = props;
    const [user, setUser] = useState(APP_CONTEXT_DEFAULT_VALUES.user);
    const [appLoading, setAppLoading] = useState(true);
    const [subscribedToEmails, setSubscribedToEmails] = useState(APP_CONTEXT_DEFAULT_VALUES.subscribedToEmails);
    const authFetchCountRef = useRef<number>(1);
    const [authenticated, setAuthenticated] = useState(APP_CONTEXT_DEFAULT_VALUES.authenticated);
    const [, setAccessToken] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    const onUserLogin = useCallback(async (user: User) => {
        const token = await user?.getIdToken();
        if (token) {
            addAxiosAuthHeader(token);
            setAccessToken(token);
            setUser(user);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setAuthenticated(!!user);
            if (user) {
                const idTokenResult = await user.getIdTokenResult();
                console.log(idTokenResult.claims);
                setSubscribedToEmails(idTokenResult.claims.subscribed as boolean || undefined);
                await onUserLogin(user);
            }
            setAppLoading(authFetchCountRef.current >= 2);
        });
        return () => unsubscribe();
    }, [onUserLogin]);

    useEffect(() => {
        const authRoutes = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.PASSWORD_RESET];
        if (authenticated && !appLoading && authRoutes.includes(pathname)) {
            router.push(ROUTES.HOME);
        }
    }, [pathname, authenticated, router, appLoading]);

    return (
        <AuthContext.Provider
            value={{
                setSubscribedToEmails,
                user,
                subscribedToEmails,
                appLoading,
                authenticated,
                onUserLogin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    return useContext(AuthContext);
};
