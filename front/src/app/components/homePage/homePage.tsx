"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/authContext";
// import UserCard from '../core/user/userCard';
import data from "../../api.json";
import { useEffect, useState } from "react";

import "./homePage.scss";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    UserCard,
} from "@/components/ui/carousel";
import { User } from "@/app/types";

const CLASSNAME = 'browse'

const mainPage: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, setUser, isJwtInCookie } = useAuth();
    const [offset, setOffset] = useState(0);
    const [profiles, setProfiles] = useState<User[]>([]);

    useEffect(() => {
        if (!isJwtInCookie("jwt_token")) {
            redirectLogin();
        }
        getProfiles()
    }, [profiles]);

    const getProfiles = () => {
        //[MOCK]
        // const response = await fetch(`http://${serverIP}:5000/browse`, {
        //     method: "POST",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });
        // const data = await response.json();
        // if (response.ok) {
        //     setProfiles(data);
        // }
        setProfiles(data.userArray);
    }

    const liked = () => {
        console.log("LIKED");
    };

    const disliked = () => {
        console.log("DISSLIKED");
    };

    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    const redirectLogin = () => {
        router.push("/login");
    };

    return (
        <>
            {user.jwt_token &&
                <div className={CLASSNAME}>
                    <div className={`${CLASSNAME}__list`}>
                        {profiles.map((profile, index) => {
                            return <UserCard
                                key={index}
                                user={profile}
                                liked={liked}
                                disliked={disliked}
                                redirect={() => redirect(profile.id)}
                            />
                        })}
                    </div>
                </div>
            }
        </>
    )
};

export default mainPage;
