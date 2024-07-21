"use client";

import { useEffect, useState } from "react";
import "./homePage.scss";
import { useAuth } from "@/app/authContext";
import { useRouter } from "next/navigation";

const mainPage: React.FC = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { user, setUser, isJwtInCookie } = useAuth();
    const redirectLogin = () => {
        router.push('/login');
    }

    useEffect(() => {
        if (!isJwtInCookie()) {
            redirectLogin();
        }

        setIsLoggedIn(isJwtInCookie());
    }, [])

    return (
        <>
            {isLoggedIn && (
                <div className="img-container">
                    <img className="img" src='/final1.svg' alt='' />
                </div>
            )}
        </>
    )
};

export default mainPage;
