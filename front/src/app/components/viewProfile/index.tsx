'use client'
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/authContext';
import data from '../../api.json'
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/carousel"

import './index.scss';
import { serverIP } from '@/app/constants';
import StarRating from '../core/rate/rate';
import { User } from '@/app/types';
import { useRouter } from 'next/navigation';

interface ProfileViewProps {
    idProps: string | string[];
}

const initialProfileViewed: User = {
    id: 0,
    username: '',
    firstname: '',
    lastname: '',
    age: 0,
    email: '',
    location: [],
    address: '',
    town: '',
    fame_rating: 0,
    is_active: false,
    is_connected: false,
    last_connexion: '',
    gender: '',
    sexual_preferences: '',
    biography: '',
    interests: [],
    photos: [],
    created_at: '',
    firstTimeLogged: false
};

const CLASSNAME = "profile2";

const ProfileView: React.FC<ProfileViewProps> = (idProps) => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { getCookie, isJwtInCookie } = useAuth();
    const [liked, setLiked] = useState(false);
    const [profileViewed, setProfileViewed] = useState<User>(initialProfileViewed);
    const currentURL = window.location.href;
    const idMatch = currentURL.match(/\/profile\/(\d+)/);

    const getOtherUserInfo = async () => {
        // try {
        //     if (idMatch) {
        //         const id = idMatch[1];
        //         const token = getCookie('jwt_token');
        //         const response = await fetch(`http://${serverIP}:5000/getOtherUserInfo`, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 "Authorization": `Bearer ${token}`,
        //             },
        //             body: JSON.stringify({
        //                 user_id: id,
        //             })
        //         });
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok');
        //         }
        //         const data = await response.json();
        //         console.log('Server response:', data);
        //         setProfileViewed(data);
        //     }
        // } catch (e) {
        //     console.log(e);
        // }
        // [MOCK]
        setProfileViewed(data.user);
    }
    const redirectLogin = () => {
        router.push('/login');
    }

    useEffect(() => {
        if (!isJwtInCookie()) {
            redirectLogin();
        }
        getOtherUserInfo();
        setIsLoggedIn(isJwtInCookie());
    })

    const handleLike = async () => {
        const token = getCookie('jwt_token');
        if (liked) {
            try {
                if (idMatch) {
                    const id = idMatch[1];
                    const response = await fetch(`http://${serverIP}:5000/dislikeUser`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            user_disliked_id: id,
                        })
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    console.log('Server response:', data);
                }
            }
            catch (e) {
                console.log(e);
            }
        } else {
            try {
                if (idMatch) {
                    const id = idMatch[1];
                    const response = await fetch(`http://${serverIP}:5000/likeUser`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            user_liked_id: id,
                        })
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    console.log('Server response:', data);
                }
            } catch (e) {
                console.log(e);
            }
        }
        setLiked((prev) => !prev);
    }

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
                                                    <img className={`${CLASSNAME}__image`} src={photo} alt='user-photo' />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                )
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
                            <p className={`${CLASSNAME}__informations-username`}>{profileViewed.username}, {profileViewed.age} years</p>
                            <div onClick={handleLike}>
                                {liked === true ? (
                                    <img className={`${CLASSNAME}__swipe-heart`} src='/like-dark-border.png' alt='' />

                                ) : (
                                    <img className={`${CLASSNAME}__swipe-heart`} src='/like-white.png' alt='' />
                                )}
                            </div>
                        </div>
                        <div className={`${CLASSNAME}__informations-location`}>
                            <img className={`${CLASSNAME}__informations-location-icon`} src='/alternate-map-marker.svg' alt='' />
                            <p className={`${CLASSNAME}__informations-location-text`}>{profileViewed.town}</p>
                        </div>
                        <StarRating rate={profileViewed.fame_rating} />
                        <p className={`${CLASSNAME}__informations-bio`}>{profileViewed.biography}</p>
                        <div className={`${CLASSNAME}__interests`}>
                            {profileViewed.interests.map((interest, index) => (
                                <span key={index} className={`${CLASSNAME}__tag-profile`}>{interest}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProfileView;