"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/authContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/carousel";

import "./index.scss";
import { serverIP } from "@/app/constants";
import StarRating from "../core/rate/rate";
import { User } from "@/app/types";
import { useRouter } from "next/navigation";

interface ProfileViewProps {
  idProps: string | string[];
}

const initialProfileViewed: User = {
  id: 0,
  username: "",
  firstname: "",
  lastname: "",
  age: 0,
  email: "",
  location: [],
  address: "",
  town: "",
  fame: 0,
  is_active: false,
  status: "",
  last_connexion: "",
  gender: "",
  sexual_preferences: "",
  biography: "",
  interests: [],
  photos: [],
  created_at: "",
  firstTimeLogged: false,
  distance: -1,
  nb_common_tags: -1,
};

const CLASSNAME = "profile2";

const ProfileView: React.FC<ProfileViewProps> = (idProps) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { getCookie, isJwtInCookie } = useAuth();
  const [liked, setLiked] = useState(false);
  const [profileViewed, setProfileViewed] =
    useState<User>(initialProfileViewed);
  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [idMatch, setIdMatch] = useState<string[] | null>(null);

  useEffect(() => {
    const currentURL = window.location.href;
    setCurrentURL(currentURL);
    setIdMatch(currentURL.match(/profile\/(\d+)/));
  }, []);

  const getOtherUserInfo = async () => {
    console.log("we enter getOtherUserInfo");
    console.log("idMatch", idMatch);
    try {
      if (idMatch) {
        const id = idMatch[1];
        const token = getCookie("jwt_token");
        const url = `http://${serverIP}:5000/api/getOtherUserInfo/${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Server response:", data);
        setProfileViewed(data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getIsUserLiked = async () => {
    try {
      if (idMatch) {
        const id = idMatch[1];
        const token = getCookie("jwt_token");
        const url = `http://${serverIP}:5000/api/doILikeThisUser/${id}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Server response:", data);
        setLiked(data.liked);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const redirectLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    if (!isJwtInCookie()) {
      redirectLogin();
    }
    getOtherUserInfo();
    getIsUserLiked();
    addViewToWatchedUser();
    setIsLoggedIn(isJwtInCookie());
  }, [idMatch]);

  const addViewToWatchedUser = async () => {
    const token = getCookie("jwt_token");
    try {
      if (idMatch) {
        const id = idMatch[1];
        const url = `http://${serverIP}:5000/viewUser/${id}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Server response:", data);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleLike = async () => {
    const token = getCookie("jwt_token");
    if (liked) {
      try {
        if (idMatch) {
          const id = idMatch[1];
          console.log("id from idMatch:", id);
          const response = await fetch(`http://${serverIP}:5000/dislikeUser`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_disliked_id: id,
            }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log("Server response:", data);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        if (idMatch) {
          const id = idMatch[1];
          console.log("id from idMatch:", id);
          const response = await fetch(`http://${serverIP}:5000/likeUser`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              user_liked_id: id,
            }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log("Server response:", data);
        }
      } catch (e) {
        console.log(e);
      }
    }
    setLiked((prev) => !prev);
  };

  const reportUser = async () => {
    const token = getCookie("jwt_token");
    try {
      if (idMatch) {
        const id = idMatch[1];
        const url = `http://${serverIP}:5000/reportUser/${id}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Server response:", data);
        router.push("/browse");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const blockUser = async () => {
    const token = getCookie("jwt_token");
    try {
      if (idMatch) {
        const id = idMatch[1];
        const url = `http://${serverIP}:5000/blockUser/${id}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Server response:", data);
        router.push("/browse");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {isLoggedIn && (
        <div className={CLASSNAME}>
          <Carousel className={`${CLASSNAME}__carousel`}>
            <CarouselContent>
              {profileViewed.photos.map((photo, index) => {
                return (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6 custo">
                          <img
                            className={`${CLASSNAME}__image`}
                            src={photo}
                            alt="user-photo"
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Carousel>

          <div className={`${CLASSNAME}__informations`}>
            <div className={`${CLASSNAME}__text-love`}>
              <p className={`${CLASSNAME}__informations-firstname`}>
                {profileViewed.firstname}, {profileViewed.age} years
              </p>
              <div onClick={handleLike}>
                {liked === true ? (
                  <img
                    className={`${CLASSNAME}__swipe-heart`}
                    src="/like-dark-border.png"
                    alt=""
                  />
                ) : (
                  <img
                    className={`${CLASSNAME}__swipe-heart`}
                    src="/like-white.png"
                    alt=""
                  />
                )}
              </div>
            </div>
            <div className={`${CLASSNAME}__informations-location`}>
              <img
                className={`${CLASSNAME}__informations-location-icon`}
                src="/alternate-map-marker.svg"
                alt=""
              />
              <p className={`${CLASSNAME}__informations-location-text`}>
                {profileViewed.town} -
              </p>
              <div className="flex items-center">
                {profileViewed.status === "online" ? (
                  <>
                    <img
                      src="/online.svg"
                      alt="Online"
                      width="16"
                      height="16"
                    />
                    <p className={"ml-2 font-bold text-green-500"}>Online</p>
                  </>
                ) : (
                  <>
                    <img
                      src="/offline.svg"
                      alt="Online"
                      width="16"
                      height="16"
                    />
                    <p
                      className={`${CLASSNAME}__informations-location-text text-[red] ml-2`}
                    >
                      {profileViewed.last_connexion}
                    </p>
                  </>
                )}
              </div>
            </div>
            <StarRating rate={profileViewed.fame} />
            <p className={`${CLASSNAME}__informations-bio`}>
              {profileViewed.biography}
            </p>
            <div className={`${CLASSNAME}__interests`}>
              {profileViewed.interests.map((interest, index) => (
                <span key={index} className={`${CLASSNAME}__tag-profile`}>
                  {interest}
                </span>
              ))}
            </div>
            <div className={`${CLASSNAME}__actions flex justify-between mt-12`}>
              <button
                className="w-1/2 bg-red-500 text-white py-2 mr-2 rounded-md border border-black"
                onClick={blockUser}
                style={{ cursor: "pointer" }}
              >
                Bloquer
              </button>
              <button
                className="w-1/2 bg-orange-500 text-white py-2 ml-2 rounded-md border border-black"
                onClick={reportUser}
                style={{ cursor: "pointer" }}
                title="Ce compte est suspect"
              >
                Signaler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileView;
