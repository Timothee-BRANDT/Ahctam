"use client";

import { useRouter, usePathname } from "next/navigation";
import { getUserFromLocalStorage, useAuth } from "@/app/authContext";
// import UserCard from '../core/user/userCard';
import data from "../../api.json";
import { useEffect } from "react";

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

const mainPage: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, setUser, isJwtInCookie } = useAuth();

    const liked = () => {
        console.log("LIKED");
    };

    const disliked = () => {
        console.log("DISSLIKED");
    };

    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    // [WARNING] Removed for dev mode confort, need to be uncommented
    useEffect(() => {
        if (!isJwtInCookie("jwtToken")) {
            redirectLogin();
        }
    }, []);

    const redirectLogin = () => {
        router.push("/login");
    };

    return (
        <div className="carousel">
            <Carousel className="w-full max-w-xs">
                <CarouselContent>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index}>
                            <div className="p-1">
                                <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-6 custo">
                                        <UserCard
                                            user={data.userArray[index]}
                                            liked={liked}
                                            disliked={disliked}
                                            redirect={() => redirect(data.userArray[index].id)}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
};

export default mainPage;
