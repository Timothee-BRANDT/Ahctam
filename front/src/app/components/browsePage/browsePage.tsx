"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/authContext";
import { User } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import { UserCard } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [isFetched, setIsFetched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const [putFilters, setPutFilters] = useState(false);
  const limit = 8;

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
  }, [offset, putFilters]);

  // WARNING: only 1 display "[]" because infinite loop with [profiles]
  // I replaced it with offset to rerender every pagination changes

  const redirect = (id: number) => {
    router.push(`/profile/${id}`);
  };

  const getProfiles = async () => {
    const cookie = getCookie("jwt_token");
    const response = await fetch(
      `http://${serverIP}:5000/browse?` +
        new URLSearchParams({
          age: String(age),
          fame: String(fame),
          distance: String(distance),
          tags: String(tags),
          offset: offset.toString(),
          limit: (offset + limit).toString(),
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
    const data_response = await response.json();
    if (response.ok) {
      console.log("From browse:", data_response);
      setProfiles(data_response.users);
      setTotalProfiles(data_response.total);
      setPutFilters(false);
    }
  };

  const goToPreviousPage = () => {
    if (offset > 0) {
      setOffset(offset - limit);
    }
  };

  const goToNextPage = () => {
    setOffset(offset + limit);
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
            <Button
              onClick={() => {
                setPutFilters(true);
                setOffset(0);
              }}
              className="btn"
            >
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
          <div className="flex justify-between mt-4">
            <Button
              onClick={goToPreviousPage}
              disabled={offset === 0}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2" /> Précédent
            </Button>
            <Button
              onClick={goToNextPage}
              disabled={offset + limit >= totalProfiles}
              className="flex items-center"
            >
              Suivant <ChevronRight className="ml-2" />
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default browsePage;
