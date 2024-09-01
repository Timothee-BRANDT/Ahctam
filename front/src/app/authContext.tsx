"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { User } from "./types";
import { useRouter } from "next/navigation";
import data from "./api.json";
import { getSocket, disconnectSocket } from "./sockets";
import { serverIP } from "@/app/constants";

const initialPig: User = {
  id: 1,
  username: "",
  firstname: "",
  lastname: "",
  age: 0,
  email: "",
  location: [],
  address: "",
  town: "",
  fame_rating: 0,
  is_active: false,
  is_connected: false,
  last_connexion: new Date(),
  gender: "",
  sexual_preferences: "",
  biography: "",
  interests: [],
  photos: [],
  created_at: new Date(),
  firstTimeLogged: true,
};

interface AuthContextType {
  login: (token: string) => void;
  logout: () => void;
  setCookie: (name: string, value: string, days?: number) => void;
  deleteCookie: (name: string) => void;
  isJwtInCookie: () => boolean;
  // NOTE: getCookie was string | undefined
  getCookie: (name: string) => string;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const AuthContext = createContext<AuthContextType>({
  user: initialPig,
  login: (token: string) => { },
  logout: () => { },
  setUser: () => { },
  setCookie: (name: string, value: string, days?: number) => { },
  deleteCookie: (name: string) => { },
  getCookie: (name: string) => "",
  isJwtInCookie: () => false,
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
    const fetchUserProfile = async () => {
      if (isJwtInCookie()) {
        try {
          const token = getCookie("jwt_token");
          const response = await fetch(
            `http://${serverIP}:5000/api/getUserInfo`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const data_response = await response.json();

          if (response.ok) {
            console.log("setuser in authContext");
            setUser({
              ...initialPig,
              ...data_response,
            });
            if (!data_response.gender) {
              router.push("/first-login");
            }
          } else {
            console.log(data_response.error);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const setCookie = (name: string, value: string, days?: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value}${expires}; path=/; SameSite=None`;
  };

  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None`;
  };

  const isJwtInCookie = () => {
    if (typeof document !== "undefined") {
      const cookies = document.cookie;
      const cookieArray = cookies.split(";");
      for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i].trim();
        if (cookie.startsWith(`jwt_token=`)) {
          return true;
        }
      }
    }
    return false;
  };

  const getCookie = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookie = parts.pop();
      if (cookie !== undefined) {
        return cookie.split(";").shift();
      }
    }
    return undefined;
  };

  const login = (token: string) => {
    setCookie("jwt_token", token, 7);
  };

  const logout = () => {
    // :TODO Here we need to pass the refresh token
    // to the server to invalidate it, in a JSON payload
    // Server is waiting for request.get_json()
    //
    // try {
    //   const response = fetch(`http://${serverIP}:5000/auth/logout`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${getCookie("jwt_token")}`,
    //     },
    //   });
    // } catch (e) {
    //   console.log(e);
    // }
    setUser(initialPig);
    deleteCookie("jwt_token");
    disconnectSocket();
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        setCookie,
        deleteCookie,
        isJwtInCookie,
        user,
        setUser,
        getCookie,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
