"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { User } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { UserCard } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import data from "../../api.json";
import "./homePage.scss";
import { limitPerQuery, serverIP } from "@/app/constants";

const CLASSNAME = 'browse2'

type Checked = DropdownMenuCheckboxItemProps["checked"];

const initialTags = {
    Tunnels: false,
    Obstacle: false,
    Naps: false,
    Vegetable: false,
    Chewing: false,
    Rolling: false,
    Baths: false,
    Hide: false,
    Collecting: false,
    Nests: false,
    Contests: false,
    Grooming: false,
    Nibbling: false,
    Cuddles: false,
    Outdoor: false,
    Company: false,
    Music: false,
    Races: false,
    Flavors: false,
    Hiding: false,
    Carrots: false,
};

const mainPage: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, setUser, isJwtInCookie } = useAuth();
    const initialRun = useRef(true);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [ageGap, setAgeGap] = useState(0);
    const [fameGap, setFameGap] = useState(0);
    const [location, setLocation] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filterByAgeValue, setFilterByAgeValue] = useState(0);
    const [filterByLocationValue, setFilterByLocationValue] = useState('');
    const [filterByFameValue, setFilterByFameValue] = useState(0);
    const [tags, setTags] = useState<Record<string, Checked>>(initialTags);
    const [filterTags, setFilterTags] = useState<Record<string, Checked>>(initialTags);
    const [responsiveSearchButton, setResponsiveSearchButton] = useState(false);
    const [responsiveFilterButton, setResponsiveFilterButton] = useState(false);

    useEffect(() => {
        if (!isJwtInCookie("jwt_token")) {
            redirectLogin();
        }
        getProfiles()
    }, [profiles]);

    const handleTagsChange = (tag: string, checked: Checked) => {
        setTags((prevTags) => ({
            ...prevTags,
            [tag]: checked,
        }));
    };

    const handleFiltersTagsChange = (tag: string, checked: Checked) => {
        setFilterTags((prevTags) => ({
            ...prevTags,
            [tag]: checked,
        }));
    };

    const handleAgeGapChange = (event: any) => {
        setAgeGap(Number(event.target.value));
    };


    const handleFameGapChange = (event: any) => {
        setFameGap(Number(event.target.value));
    };

    const handleLocationChange = (event: any) => {
        setLocation(event.target.value);
    };

    const handleFilters = async () => {
        // let filterTagsArray: string[] = [];
        // Object.keys(filterTags).map((tag) => {
        //     if (filterTags[tag]) {
        //         filterTagsArray.push(tag);
        //     }
        // })
        // const response = await fetch(`http://${serverIP}:5000/browse?` + new URLSearchParams({
        //     sortBy: String(sortBy),
        //     filterAge: String(filterByAgeValue),
        //     filterFame: String(filterByFameValue),
        //     filterLocation: filterByLocationValue,
        //     filterTags: filterTagsArray.join(','),
        // }), {
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
        setResponsiveFilterButton(false);
    };

    const getProfiles = async () => {
        // const response = await fetch(`http://${serverIP}:5000/browse?` + new URLSearchParams({
        //     offset: String(offset),
        //     limit: String(limitPerQuery),
        // }), {
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
        // [MOCK]
        setProfiles(data.userArray);
    }

    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    const redirectLogin = () => {
        router.push("/login");
    };

    const toggleResponsiveFilter = (event: React.MouseEvent) => {
        event.stopPropagation(); // Arrête la propagation de l'événement de clic
        setResponsiveFilterButton(prevState => !prevState); // Basculer l'état
    };


    return (
        <>
            {user.jwt_token && (
                <>
                    <div className="filter-image2" onClick={toggleResponsiveFilter} >
                        <img src='/filters.svg' alt='' />
                    </div>
                    {responsiveFilterButton && <div className="filters2">
                        <Input
                            onChange={handleAgeGapChange}
                            type="number"
                            placeholder="Specific Age"
                        />
                        <Input
                            onChange={handleFameGapChange}
                            type="number"
                            placeholder="Specific Fame"
                        />
                        <Input
                            onChange={handleLocationChange}
                            type="text"
                            placeholder="Specific Location"
                        />
                        <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Specific tags</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                                {Object.keys(tags).map((tag) => (
                                    <DropdownMenuCheckboxItem
                                        key={tag}
                                        onSelect={(event) => event.preventDefault()}
                                        checked={tags[tag]}
                                        onCheckedChange={(checked) => handleTagsChange(tag, checked)}
                                    >
                                        {tag}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Sort By</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                                    <DropdownMenuRadioItem value="age">Age</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="location">Location</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="fame_rating">Fame Rating</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="common_tags">Common Tags</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleFilters}>Apply filters</Button>
                    </div>}
                    <div className={CLASSNAME}>
                        <div className={`${CLASSNAME}__list2`}>
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

export default mainPage;
