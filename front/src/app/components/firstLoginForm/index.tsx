"use client";
import React, { useEffect, useState, useRef } from "react";
import "./index.scss";
import { Button } from "@/components/ui/button";
import { serverIP } from "@/app/constants";
import { useAuth } from "@/app/authContext";
import { initializeSocket } from "@/app/sockets";
import { FirstLoginInformations } from "@/app/types";
import { usePathname, useRouter } from "next/navigation";

const CLASSNAME = "profile";
const MAX_PHOTOS = 6;

var localisationjpp: number[] = [0, 0];
var townjpp: string = "";

const FirstLoginPage: React.FC = () => {
  const { user, setUser, isJwtInCookie, getCookie } = useAuth();
  const [allowGeolocation, setAllowGeolocation] = useState(false);
  const hasFetchedFormular = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [geolocationPermission, setGeolocationPermission] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const router = useRouter();

  const initInterests: Record<string, boolean> = {
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

  const initializeInterests = (
    initialState: Record<string, boolean>,
    interestsArray: string[],
  ): Record<string, boolean> => {
    const updatedState = { ...initialState };
    interestsArray.forEach((interest) => {
      if (updatedState.hasOwnProperty(interest)) {
        updatedState[interest] = true;
      }
    });
    return updatedState;
  };

  const filledPhotos = user.photos ? [...user.photos] : [];
  while (filledPhotos.length < MAX_PHOTOS) {
    filledPhotos.push("Upload a picture");
  }

  // [MOCK]
  const [allInterests, setAllInterests] = useState<Record<string, boolean>>(
    initializeInterests(initInterests, []),
  );

  const redirectLogin = () => {
    router.push("/login");
  };

  useEffect(() => {
    console.log("useEffect is called");
    if (!isJwtInCookie) {
      redirectLogin();
    } else {
      setIsLoggedIn(true);
      if (!geolocationPermission) {
        askLocationPermission();
        setGeolocationPermission(true);
      }
    }
  }, [isJwtInCookie, geolocationPermission]);

  const askLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localisationjpp = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          console.log("localisationjpp", localisationjpp);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          localisationjpp = [0, 0];
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        },
      );
    }
  };

  const handleUserChange = (e: any) => {
    console.log("handleUserChange is called");
    const { name, value } = e.target;
    if (name && value !== undefined) {
      setUser({
        ...user,
        [name]: value,
      });
    }
  };

  const handleImageChange = (index: any, e: any) => {
    console.log("handleImageChange is called");
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = user.photos ? [...user.photos] : [];
      newPhotos[index] = reader.result as string;
      setUser({
        ...user,
        photos: newPhotos,
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("we clicked on the Save button");
    const payload = {
      token: getCookie("jwt_token"),
      age: user.age,
      gender: user.gender,
      sexual_preferences: user.sexual_preferences,
      biography: user.biography,
      interests: user.interests,
      photos: user.photos,
      location: localisationjpp,
    };
    console.log("payload we send:", payload);
    if (!payload.sexual_preferences) {
      payload.sexual_preferences = "both";
    }
    const response = await fetch(`http://${serverIP}:5000/auth/first-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payload,
      }),
    });
    if (response.ok) {
      const token = getCookie("jwt_token");
      const socket = initializeSocket(token);
      router.push("/");
    } else {
      console.log("Error while sending the formular");
    }
  };

  const getInterestsIndices = (record: Record<string, boolean>) => {
    console.log("getInterestsIndices is called");
    return Object.entries(record).reduce(
      (acc: string[], [key, value], index) => {
        if (value) {
          acc.push(key);
        }
        return acc as string[];
      },
      [],
    );
  };

  const selectInterest = (interest: string) => {
    console.log("selectInterest is called");
    const newInterests = { ...allInterests };
    newInterests[interest] = !newInterests[interest];
    setAllInterests(newInterests);
    const trueIndices = getInterestsIndices(newInterests);
    setUser({
      ...user,
      interests: trueIndices,
    });
  };

  return (
    <>
      {isLoggedIn && (
        <div className={CLASSNAME}>
          <form onSubmit={handleSubmit}>
            <div className={`${CLASSNAME}__web-layout`}>
              <div>
                <div className={`${CLASSNAME}__info-container`}>
                  <p className={`${CLASSNAME}__title`}>Age</p>
                  <input
                    className={`${CLASSNAME}__update-input`}
                    type="age"
                    name="age"
                    value={user.age}
                    onChange={handleUserChange}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <p className={`${CLASSNAME}__title`}>I am</p>
                <div className={`${CLASSNAME}__radio-button`}>
                  <div>
                    <input
                      type="radio"
                      id="gender-female"
                      name="gender"
                      value="female"
                      checked={user.gender === "female"}
                      onChange={handleUserChange}
                    />
                    <label htmlFor="gender-female">Female</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="gender-male"
                      name="gender"
                      value="male"
                      checked={user.gender === "male"}
                      onChange={handleUserChange}
                    />
                    <label htmlFor="gender-male">Male</label>
                  </div>
                  <div>
                    <input
                      className="other-hidden"
                      type="radio"
                      id="gender-other"
                      name="gender"
                      value="other"
                      checked={user.gender === "other"}
                      onChange={handleUserChange}
                    />
                    <label className="other-hidden" htmlFor="gender-other">
                      Other
                    </label>
                  </div>
                </div>

                <p className={`${CLASSNAME}__title`}>I'm looking for</p>
                <div className={`${CLASSNAME}__radio-button`}>
                  <div>
                    <input
                      type="radio"
                      id="sexual-female"
                      name="sexual_preferences"
                      value="female"
                      checked={user.sexual_preferences === "female"}
                      onChange={handleUserChange}
                    />
                    <label htmlFor="sexual-female">Female</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="sexual-male"
                      name="sexual_preferences"
                      value="male"
                      checked={user.sexual_preferences === "male"}
                      onChange={handleUserChange}
                    />
                    <label htmlFor="sexual-male">Male</label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      id="sexual-both"
                      name="sexual_preferences"
                      value="both"
                      checked={user.sexual_preferences === "both"}
                      onChange={handleUserChange}
                    />
                    <label htmlFor="sexual-both">Both</label>
                  </div>
                </div>

                <p className={`${CLASSNAME}__title`}>About me</p>
                <textarea
                  rows={7}
                  name="biography"
                  spellCheck="false"
                  value={user.biography}
                  onChange={handleUserChange}
                />
              </div>
              <div className="lol">
                <p className={`${CLASSNAME}__title`}>My interests</p>
                <div className={`${CLASSNAME}__interests-container`}>
                  {Object.entries(allInterests).map(
                    ([interest, isSelected]) => (
                      <div
                        className={
                          !isSelected
                            ? `${CLASSNAME}__interests`
                            : `${CLASSNAME}__interests__selected`
                        }
                        onClick={() => {
                          selectInterest(interest);
                        }}
                        key={interest}
                      >
                        {interest}
                      </div>
                    ),
                  )}
                </div>
                <p className={`${CLASSNAME}__title`}>My Pictures</p>
                <div className="photo-upload-container">
                  {filledPhotos.map((photo: string, index: number) => (
                    <div
                      onClick={() =>
                        document
                          .getElementsByName(`photoUpload${index}`)[0]
                          .click()
                      }
                      key={index}
                      className="photo-placeholder"
                      style={{
                        backgroundImage: photo ? `url(${photo})` : "none",
                      }}
                    >
                      <input
                        type="file"
                        name={`photoUpload${index}`}
                        accept="image/*"
                        onChange={(e) => handleImageChange(index, e)}
                        style={{ display: "none" }}
                      />
                      {!photo && (
                        <div
                          className={`upload-text ${index === 0
                              ? `${CLASSNAME}__profile-picture-uploader`
                              : ""
                            }`}
                        >
                          {index === 0
                            ? "Upload a profile picture"
                            : "Upload a picture"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Button
              className="button-info"
              type="submit"
              disabled={loadingLocation}
              onClick={() => { }}
            >
              Save
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default FirstLoginPage;
