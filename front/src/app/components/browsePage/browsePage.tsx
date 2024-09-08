"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { User } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { UserCard } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import data from "../../api.json";
import "./browsePage.scss";
import { Slider } from "@/components/ui/slider";
import { serverIP } from "@/app/constants";

const CLASSNAME = "browse";

type Checked = DropdownMenuCheckboxItemProps["checked"];

const browsePage: React.FC = () => {
    const [age, setAge] = useState(0);
    const [fame, setFame] = useState(0);
    const [distance, setDistance] = useState(0);
    const [tags, setTags] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [responsiveFilterButton, setResponsiveFilterButton] = useState(false);

    const router = useRouter();

    const { isJwtInCookie, getCookie } = useAuth();

    const redirectLogin = () => {
        router.push("/login");
    };
    useEffect(() => {
        if (!isJwtInCookie()) {
            redirectLogin();
        }
        getProfiles();
        setIsLoggedIn(isJwtInCookie());
    }, [profiles]);

    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    const getProfiles = async () => {
        const cookie = getCookie("jwt_token");
        const response = await fetch(
            `http://${serverIP}:5000/browse?` +
            new URLSearchParams({
                offset: String(0),
                limit: String(9),
            }),
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cookie}`,
                },
            },
        );
        const data = await response.json();
        if (response.ok) {
            setProfiles(data);
        }
        // [MOCK]
        // setProfiles(data.userArray);
    };

    const applyFilters = async () => {
        const response = await fetch(
            `http://${serverIP}:5000/browse?` +
            new URLSearchParams({
                age: String(age),
                fame: String(fame),
                distance: String(distance),
                tags: String(tags),
            }),
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
        const data = await response.json();
        if (response.ok) {
            setProfiles(data);
        }
    };

    const toggleResponsiveFilter = (event: React.MouseEvent) => {
        event.stopPropagation();
        setResponsiveFilterButton((prevState) => !prevState);
    };
    const handleSliderAgeChange = (value: number[]) => {
        setAge(value[0]);
    };
    const handleSliderFameChange = (value: number[]) => {
        setFame(value[0]);
    };
    const handleSliderDistanceChange = (value: number[]) => {
        setDistance(value[0]);
    };
    const handleSliderTagsChange = (value: number[]) => {
        setTags(value[0]);
    };

    return (
        <>
            {isLoggedIn && (
                <>
                    <div className="filter-image" onClick={toggleResponsiveFilter}>
                        <img src="/filters.svg" alt="" />
                    </div>
                    {responsiveFilterButton && (
                        <div className="sliders">
                            <div className="w-60 h-50 flex flex-col items-center gap-4">
                                <div className="sliders-text text-1xl font-bold">
                                    Age - {age} {age > 1 ? "years" : "year"}
                                </div>
                                <Slider
                                    value={[age]}
                                    onValueChange={handleSliderAgeChange}
                                    min={0}
                                    max={30}
                                    step={1}
                                />
                                <div className="sliders-text text-1xl font-bold">
                                    Fame - {fame}
                                </div>
                                <Slider
                                    value={[fame]}
                                    onValueChange={handleSliderFameChange}
                                    min={0}
                                    max={5}
                                    step={1}
                                />
                            </div>
                            <div className="w-60 h-50 flex flex-col items-center gap-4">
                                <div className="sliders-text text-1xl font-bold">
                                    Distance - {distance} {distance > 1 ? "kms" : "km"}
                                </div>
                                <Slider
                                    value={[distance]}
                                    onValueChange={handleSliderDistanceChange}
                                    min={0}
                                    max={100}
                                    step={1}
                                />
                                <div className="sliders-text text-1xl font-bold">
                                    Common Tags - {tags}
                                </div>
                                <Slider
                                    value={[tags]}
                                    onValueChange={handleSliderTagsChange}
                                    min={0}
                                    max={20}
                                    step={1}
                                />
                            </div>
                        </div>
                    )}
                    {responsiveFilterButton && (
                        <Button onClick={applyFilters} className="btn">
                            Apply filters
                        </Button>
                    )}
                    <div className={CLASSNAME}>
                        <div className={`${CLASSNAME}__list`}>
                            {profiles.map((profile, index) => {
                                return (
                                    <UserCard
                                        key={index}
                                        user={profile}
                                        redirect={() => redirect(profile.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default browsePage;
