"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { User, Notification } from "./types";
import { initializeSocket } from "@/app/sockets";
import { useRouter } from "next/navigation";
import { getSocket, disconnectSocket } from "./sockets";
import { serverIP } from "@/app/constants";
import { Snackbar, Alert } from "@mui/material";
import ReactDOM from "react-dom";

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
  status: "",
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
  login: (token: string) => {},
  logout: () => {},
  setUser: () => {},
  setCookie: (name: string, value: string, days?: number) => {},
  deleteCookie: (name: string) => {},
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
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);
  const [socket, setSocket] = useState<any>(null);

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
            setUser({
              ...initialPig,
              ...data_response,
            });
            if (!data_response.gender) {
              router.push("/first-login");
            }
            if (token) {
              const newSocket = initializeSocket(token);
              setSocket(newSocket);
              setupSocketListeners(newSocket);
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

  const setupSocketListeners = (socket: any) => {
    if (socket) {
      socket.on("notification", (data: any) => {
        console.log("New notification:", data.message);
        setNotification(data);
        setOpen(true);
      });
    }
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const setCookie = (name: string, value: string, days?: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    const sameSiteSecure =
      window.location.protocol === "https:" ? "; SameSite=None; Secure" : "";

    document.cookie = `${name}=${value}${expires}; path=/${sameSiteSecure}`;
    // document.cookie = `${name}=${value}${expires}; path=/; SameSite=None`;
  };

  const deleteCookie = (name: string) => {
    const sameSiteSecure =
      window.location.protocol === "https:" ? "; SameSite=None; Secure" : "";

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${sameSiteSecure}`;
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
    const newSocket = initializeSocket(token);
    setSocket(newSocket);
    setupSocketListeners(newSocket);
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

      {/* Utilisation de ReactDOM.createPortal pour rendre la Snackbar */}
      {typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              icon={false}
              severity="success"
              sx={{ width: "100%" }}
              style={{
                cursor: "pointer",
                backgroundColor: "lightcoral",
                color: "white",
              }}
            >
              <p
                onClick={() =>
                  router.push(`/profile/${notification?.sender_id}`)
                }
              >
                {notification?.message}
              </p>
            </Alert>
          </Snackbar>,
          document.body, // On rend le composant directement dans le body
        )}
    </AuthContext.Provider>
  );
};
