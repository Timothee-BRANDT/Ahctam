'use client'
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { User } from './types';


const initialPig: User = {
	id: 1,
	userName: '',
	firstName: '',
	lastName: '',
	email: '',
	password_hash: '',
	is_active: false,
	registration_token: '',
	jwt_token: '',
	gender: '',
	sexual_preferences: '',
	biography: '',
	interests: '',
	created_at: '',
};

interface AuthContextType {
  login: (user: User) => void;
  logout: () => void;
  setCookie: (name: string, value: string, days?: number) => void;
  deleteCookie: (name: string) => void;
  isJwtInCookie: (name: string) => boolean;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const AuthContext = createContext<AuthContextType>({
  login: (user: User) => {},
  logout: () => {},
  setUser: () => {},
  setCookie: (name: string, value: string, days?: number) => {},
  deleteCookie: (name: string) => {}, user: initialPig,
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

  const login = (user: User) => {
      setCookie('jwtToken', user.jwt_token, 7);
  }

  const logout = () => {
    setUser(initialPig);
    deleteCookie('jwtToken');
  };

  return (
    <AuthContext.Provider value={{login, logout, setCookie, deleteCookie, isJwtInCookie, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
