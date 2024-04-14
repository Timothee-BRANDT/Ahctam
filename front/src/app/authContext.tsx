'use client'
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User } from './types';

interface AuthContextType {
  login: (user: User) => void;
  logout: () => void;
  setCookie: (name: string, value: string, days?: number) => void;
  deleteCookie: (name: string) => void,
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  login: (user: User) => {}, logout: () => {}, setCookie: (name: string, value: string, days?: number) => {},
  deleteCookie: (name: string) => {}, user: null, setUser: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  const setCookie = (name: string, value: string, days?: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value}${expires}; path=/; Secure; SameSite=Strict`;
  }

  const deleteCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict`;
  }

  const login = (user: User) => {
      setCookie('jwtToken', user.jwt_token, 7);
  }

  const logout = () => {
    setUser(null);
    console.log(user);
    deleteCookie('jwtToken');
  };

  return (
    <AuthContext.Provider value={{login, logout, setCookie, deleteCookie, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
