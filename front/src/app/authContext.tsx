'use client'
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User } from './types';
import { useRouter } from 'next/navigation';
import data from './api.json';

const initialPig: User = {
    id: 1,
    username: '',
    firstname: '',
    lastname: '',
    age: 0,
    email: '',
    password: '',
    location: [],
    address: '',
    town: '',
    fame_rating: 0,
    confirmPassword: '',
    is_active: false,
    is_connected: false,
    last_connexion: new Date(),
    registration_token: '',
    jwt_token: '',
    refresh_token: '',
    gender: '',
    sexual_preferences: '',
    biography: '',
    interests: [],
    photos: [],
    created_at: '',
    firstTimeLogged: true,
}

interface AuthContextType {
    login: (user: User) => void;
    logout: () => void;
    setCookie: (name: string, value: string, days?: number) => void;
    deleteCookie: (name: string) => void;
    isJwtInCookie: (name: string) => boolean;
    getCookie: (name: string) => string | undefined;
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
}

const AuthContext = createContext<AuthContextType>({
    user: initialPig,
    login: (user: User) => { },
    logout: () => { },
    setUser: () => { },
    setCookie: (name: string, value: string, days?: number) => { },
    deleteCookie: (name: string) => { },
    getCookie: (name: string) => '',
    isJwtInCookie: (name: string) => false,
});

export function useAuth() {
    return useContext(AuthContext);
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User>(initialPig);
    const router = useRouter();

    useEffect(() => {
        if (isJwtInCookie("jwt_token")) {
            // [MOCK]
            // should call the endpoint with the cookie to get all the userInfo
            setUser(data.user);
        }
    }, []);

    const setCookie = (name: string, value: string, days?: number) => {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${value}${expires}; path=/; SameSite=None`;
    }

    const deleteCookie = (name: string) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None`;
    }

    const isJwtInCookie = (name: string) => {
        const cookies = document.cookie;
        const cookieArray = cookies.split(';');

        for (let i = 0; i < cookieArray.length; i++) {
            const cookie = cookieArray[i].trim();
            if (cookie.startsWith(`${name}=`)) {
                return true;
            }
        }
        return false;
    }

    const getCookie = (name: string): string | undefined => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            const cookie = parts.pop();
            if (cookie !== undefined) {
                return cookie.split(';').shift();
            }
        }
        return undefined;
    };

    const login = (user: User) => {
        setCookie('jwt_token', user.jwt_token, 7);
        setUser(user);
    }

    const logout = () => {
        setUser(initialPig);
        deleteCookie('jwt_token');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ login, logout, setCookie, deleteCookie, isJwtInCookie, user, setUser, getCookie }}>
            {children}
        </AuthContext.Provider>
    );
};
