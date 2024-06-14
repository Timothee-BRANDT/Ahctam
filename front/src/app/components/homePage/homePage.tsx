"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { User } from "@/app/types";
import { useEffect, useState } from "react";
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
import { serverIP } from "@/app/constants";

const CLASSNAME = 'browse'

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
    const [offset, setOffset] = useState(0);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [ageGap, setAgeGap] = useState(0);
    const [fameGap, setFameGap] = useState(0);
    const [location, setLocation] = useState('');
    const [filterBy, setFilterBy] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filterByAgeValue, setFilterByAgeValue] = useState(0);
    const [filterByLocationValue, setFilterByLocationValue] = useState(0);
    const [filterByFameValue, setFilterByFameValue] = useState(0);
    const [tags, setTags] = useState<Record<string, Checked>>(initialTags);

    useEffect(() => {
        if (!isJwtInCookie("jwt_token")) {
            redirectLogin();
        }
        getProfiles()
    }, [profiles]);

    const handleCheckedChange = (tag: string, checked: Checked) => {
        setTags((prevTags) => ({
            ...prevTags,
            [tag]: checked,
        }));
    };

    const handleAgeGapChange = (event: any) => {
        setAgeGap(Number(event.target.value));
    };

    const handleFilterByAgeValueChange = (event: any) => {
        setFilterByAgeValue(Number(event.target.value));
    };

    const handleFilterByLocationValueChange = (event: any) => {
        setFilterByLocationValue(event.target.value);
    };

    const handleFilterByFameValueChange = (event: any) => {
        setFilterByFameValue(event.target.value);
    };

    const handleFameGapChange = (event: any) => {
        setFameGap(Number(event.target.value));
    };

    const handleLocationChange = (event: any) => {
        setLocation(event.target.value);
    };

    const handleSearch = async () => {
        //[MOCK]
        let tagsArray: string[] = [];
        Object.keys(tags).map((tag) => {
            if (tags[tag]) {
                tagsArray.push(tag);
            }
        })
        console.log(tagsArray);
        const response = await fetch(`http://${serverIP}:5000/browse?` + new URLSearchParams({
            ageGap: String(ageGap),
            fameGap: String(fameGap),
            location: location,
            tags: tagsArray.join(','),
        }), {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (response.ok) {
            setProfiles(data);
        }
    };

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
    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    const redirectLogin = () => {
        router.push("/login");
    };

    return (
        <>
            {user.jwt_token && (
                <>
                    <div className="search-and-filters">
                        <div className="search">
                            <Input
                                onChange={handleAgeGapChange}
                                type="number"
                                placeholder="Age Gap"
                            />
                            <Input
                                onChange={handleFameGapChange}
                                type="number"
                                placeholder="Fame Gap (from 1 to 5)"
                            />
                            <Input
                                onChange={handleLocationChange}
                                type="text"
                                placeholder="Location"
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">List of common tags</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                                    {Object.keys(tags).map((tag) => (
                                        <DropdownMenuCheckboxItem
                                            key={tag}
                                            onSelect={(event) => event.preventDefault()}
                                            checked={tags[tag]}
                                            onCheckedChange={(checked) => handleCheckedChange(tag, checked)}
                                        >
                                            {tag}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={handleSearch} className="search-button">Search</Button>
                        </div>
                        <div className="filters">
                            <div className="filters-selectors">
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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">Filter By</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuRadioGroup value={filterBy} onValueChange={setFilterBy}>
                                            <DropdownMenuRadioItem value="age">Age</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="location">Location</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="fame_rating">Fame Rating</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="common_tags">Common Tags</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {filterBy === 'age' && (
                                    <Input
                                        onChange={handleFilterByAgeValueChange}
                                        type="number"
                                        placeholder="What age ?"
                                    />
                                )}
                                {filterBy === 'location' && (
                                    <Input
                                        onChange={handleFilterByLocationValueChange}
                                        type="string"
                                        placeholder="Which town ?"
                                    />
                                )}
                                {filterBy === 'fame_rating' && (
                                    <Input
                                        onChange={handleFilterByFameValueChange}
                                        type="number"
                                        placeholder="How much fame ?"
                                    />
                                )}
                                {filterBy === 'common_tags' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline">Filter By Tags</Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                                            {Object.keys(tags).map((tag) => (
                                                <DropdownMenuCheckboxItem
                                                    key={tag}
                                                    onSelect={(event) => event.preventDefault()}
                                                    checked={tags[tag]}
                                                    onCheckedChange={(checked) => handleCheckedChange(tag, checked)}
                                                >
                                                    {tag}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            <Button className="search-button">Apply filters</Button>
                        </div>
                    </div>
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

export default mainPage;
