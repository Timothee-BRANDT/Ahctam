"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { User } from "@/app/types";
import { useEffect, useState } from "react";
import { UserCard } from "@/components/ui/carousel";


import data from "../../api.json";
import "./historyPage.scss";

const CLASSNAME = 'browse'

const historyPage: React.FC = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profiles, setProfiles] = useState<User[]>([]);

    const { isJwtInCookie, getCookie } = useAuth();

    const redirectLogin = () => {
        router.push('/login');
    }

    useEffect(() => {
        if (!isJwtInCookie()) {
            redirectLogin();
        }
        getProfiles()
        setIsLoggedIn(isJwtInCookie());
    }, [profiles]);

    const getProfiles = async () => {
        // const token = getCookie('jwt_token');
        // const response = await fetch(`http://${serverIP}:5000/getMyViews`, {
        //     method: "GET",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //         "Authorization": `Bearer ${token}`,
        //     },
        // });
        // const data = await response.json();
        // if (response.ok) {
        //     setProfiles(data);
        // }
        // [MOCK]
        setProfiles(data.userArray);
    }

    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    return (
        <>
            {isLoggedIn && (
                <>
                    <div className={CLASSNAME}>
                        <div className={`${CLASSNAME}__list`}>
                            {profiles.map((profile, index) => {
                                return <UserCard
                                    key={index}
                                    user={profile}
                                    redirect={() => redirect(profile.id)}
                                />
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    )
};

export default historyPage;