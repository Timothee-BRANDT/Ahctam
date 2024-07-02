"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { PaginationType, User } from "@/app/types";
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

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import data from "../../api.json";
import "./homePage.scss";
import { limitPerQuery, serverIP } from "@/app/constants";

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
    const initialRun = useRef(true);
    const [offset, setOffset] = useState(0);
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
        if (initialRun.current) {
            getProfiles(PaginationType.next)
            initialRun.current = false;
        }
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
        let tagsArray: string[] = [];
        Object.keys(tags).map((tag) => {
            if (tags[tag]) {
                tagsArray.push(tag);
            }
        })
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

    const handleFilters = async () => {
        let filterTagsArray: string[] = [];
        Object.keys(filterTags).map((tag) => {
            if (filterTags[tag]) {
                filterTagsArray.push(tag);
            }
        })
        const response = await fetch(`http://${serverIP}:5000/browse?` + new URLSearchParams({
            sortBy: String(sortBy),
            filterAge: String(filterByAgeValue),
            filterFame: String(filterByFameValue),
            filterLocation: filterByLocationValue,
            filterTags: filterTagsArray.join(','),
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

    const getProfiles = async (click: PaginationType) => {
        if (click === PaginationType.previous) {
            setOffset((prev) => prev - limitPerQuery);
        }
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
        if (click === PaginationType.next) {
            setOffset((prev) => prev + limitPerQuery);
        }
    }

    const redirect = (id: number) => {
        router.push(`/profile/${id}`);
    };

    const redirectLogin = () => {
        router.push("/login");
    };

    const openResponsiveSearch = () => {
        setResponsiveSearchButton((prev) => !prev);
    }
    const openResponsiveFilter = () => {
        setResponsiveFilterButton((prev) => !prev);
    }

    return (
        <>
            {user.jwt_token && (
                <>
                    <div className="responsiveSearchAndFilters">
                        <Button className="responsiveSearchButton" onClick={openResponsiveSearch}>{responsiveSearchButton ? 'Close Search' : 'Open Search'}</Button>
                        <Button className="responsiveFilterButton" onClick={openResponsiveFilter}>{responsiveFilterButton ? 'Close Filters' : 'Open Filters'}</Button>
                    </div>
                    <div className="search-and-filters">
                        <div className={responsiveSearchButton ? 'search' : 'search-hidden'}>
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
                                            onCheckedChange={(checked) => handleTagsChange(tag, checked)}
                                        >
                                            {tag}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button onClick={handleSearch} className="search-button">Search</Button>
                        </div>
                        <div className={responsiveFilterButton ? 'filters' : 'filters-hidden'}>
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
                            <DropdownMenu>
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
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious onClick={() => getProfiles(PaginationType.previous)} />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext onClick={() => getProfiles(PaginationType.next)} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </>
            )}
        </>
    )
};

export default mainPage;
