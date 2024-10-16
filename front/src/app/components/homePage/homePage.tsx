"use client";

import { useEffect, useState } from "react";
import "./homePage.scss";
import { useAuth } from "@/app/authContext";
import { useRouter } from "next/navigation";

const mainPage: React.FC = () => {
  const router = useRouter();
  const query = new URLSearchParams(location.search);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { user, setUser, isJwtInCookie, setCookie } = useAuth();
  const redirectLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    const token = query.get("token");
    if (!isJwtInCookie() && !token) {
      redirectLogin();
    } else if (token) {
      setCookie("jwt_token", token, 7);
    }

    setIsLoggedIn(isJwtInCookie());
  }, []);

  return (
    <>
      {isLoggedIn && (
        <div className="img-container">
          <img className="img" src="/final1.svg" alt="" />
        </div>
      )}
    </>
  );
};

export default mainPage;
