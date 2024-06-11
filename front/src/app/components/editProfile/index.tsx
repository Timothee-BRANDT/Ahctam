"use client";
import React, { useEffect, useState } from "react";
import "./index.scss";
import Button from "../core/button/button";
import { serverIP } from "@/app/constants";
import { useAuth } from "@/app/authContext";
import { ProfileInformations } from "@/app/types";
import { usePathname, useRouter } from "next/navigation";
import data from '../../api.json';

const CLASSNAME = "profile";

var requestOptions = {
    method: 'GET',
};
const ProfilePage: React.FC = () => {
    const { user, setUser, isJwtInCookie } = useAuth();
    const router = useRouter();
    const [adressInput, setAdressInput] = useState('');
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [allInterests, setAllInterests] = useState<Record<string, boolean>>({
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
    });

    const getProfile = async () => {
        // [MOCK]
        // const response = await fetch(`http://${serverIP}:5000/getUserInfo`, {
        //     method: "POST",
        //     credentials: "include",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });
        // const data = await response.json();
        // if (response.ok) {
        //     setUser(data);
        // }

        setUser(data.user);
        data.user.interests.map((interest) => {
            allInterests[interest] = true;
        })
    }

    useEffect(() => {
        if (!isJwtInCookie("jwtToken")) {
            redirectLogin();
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
            }, (e) => {
                console.log('Geolocation error');
            })
        }


        getProfile();
    }, []);

    const convertAdressIntoCoordonates = async () => {
        console.log(adressInput);
        const formattedAddress = encodeURIComponent(adressInput);
        console.log(formattedAddress)
        const apiKey = '0b45c5495f8e4f9b8246deebf999830d';

        await fetch(`https://api.geoapify.com/v1/geocode/search?text=${formattedAddress}&apiKey=${apiKey}`,
            requestOptions)
            .then(response => response.json())
            .then(result => {
                console.log(result)
            })
            .catch(error => console.log('error', error));
        
    }

    const redirectLogin = () => {
        router.push("/login");
    };


    const handleUserChange = (e: any) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value,
        });
    };

    const handleAdressChange = (e: any) => {
        const { name, value } = e.target;
        setAdressInput(value);
    };


    const handleImageChange = (index: any, e: any) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            const newPhotos = [...user.photos];
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
        const payload = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            gender: user.gender,
            sexual_preferences: user.sexual_preferences,
            biography: user.biography,
            interests: user.interests,
            photos: user.photos,
            latitude,
            longitude,
        };
        if (!payload.sexual_preferences) {
            payload.sexual_preferences = "both";
        }
        if (!payload.gender) {
            payload.gender = "other";
        }
        convertAdressIntoCoordonates();
        console.log(payload);
        // TODO: C'EST ICI POUR L'ENDPOINT
        const response = await fetch(`http://${serverIP}:5000/auth/first-login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                payload,
            }),
        });
        if (response.ok) {
            router.push('/');
            // WARNING: I removed the redirection for testing purposes
            // router.push("/");
        }
    };

    const getInterestsIndices = (record: Record<string, boolean>) => {
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
            <div className={CLASSNAME}>
                <form onSubmit={handleSubmit}>
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Firstname</p>
                        <input
                            className={`${CLASSNAME}__update-input`}
                            type="firstname"
                            name="firstname"
                            value={user.firstname}
                            onChange={handleUserChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Lastname</p>
                        <input
                            className={`${CLASSNAME}__update-input`}
                            type="lastname"
                            name="lastname"
                            value={user.lastname}
                            onChange={handleUserChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>
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
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Location</p>
                        <input
                            className={`${CLASSNAME}__update-input`}
                            type="location"
                            name="location"
                            value={user.location}
                            onChange={handleAdressChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Email</p>
                        <input
                            className={`${CLASSNAME}__update-input`}
                            type="email"
                            name="email"
                            value={user.email}
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
                                type="radio"
                                id="gender-other"
                                name="gender"
                                value="other"
                                checked={user.gender === "other"}
                                onChange={handleUserChange}
                            />
                            <label htmlFor="gender-other">Other</label>
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
                        name="biography"
                        spellCheck="false"
                        value={user.biography}
                        onChange={handleUserChange}
                    />
                    <p className={`${CLASSNAME}__title`}>My interests</p>
                    <div className={`${CLASSNAME}__interests-container`}>
                        {Object.entries(allInterests).map(([interest, isSelected]) => (
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
                        ))}
                    </div>
                    <p className={`${CLASSNAME}__title`}>My Pictures</p>
                    <div className="photo-upload-container">
                        {user.photos.map((photo: string, index: number) => (
                            <div
                                onClick={() =>
                                    document.getElementsByName(`photoUpload${index}`)[0].click()
                                }
                                key={index}
                                className="photo-placeholder"
                                style={{ backgroundImage: photo ? `url(${photo})` : "none" }}
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
                    <Button
                        className="button-info"
                        title="Save"
                        type="submit"
                        onClick={() => { }}
                    />
                </form>
            </div>
        </>
    );
};

export default ProfilePage;
