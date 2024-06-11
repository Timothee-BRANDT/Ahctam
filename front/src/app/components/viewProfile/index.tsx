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

interface ProfileViewProps {
    id: string | string[];
}

const CLASSNAME = 'profile';

const ProfileView: React.FC<ProfileViewProps> = (id) => {

    // need to init this state whith the reponse of the endpoint i asked to Edouard
    // something like http://${serverIP}:5000/isLiked
    // that just return true or false, if i've liked him or not
    const [liked, setLiked] = useState(false);

    // const getUser = async () => {
    //     try {
    //         const response = await fetch(`http://${serverIP}:5000/getUser/${id}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //         });

    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }
    //         const data = await response.json();
    //         console.log('Server response:', data);
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }


    useEffect(() => {
        var requestOptions = {
            method: 'GET',
        };

        fetch("https://api.geoapify.com/v1/geocode/search?text=38%20Upper%20Montagu%20Street%2C%20Westminster%20W1H%201LJ%2C%20United%20Kingdom&apiKey=0b45c5495f8e4f9b8246deebf999830d", requestOptions)
            .then(response => response.json())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    })

    const user = data.user; // mock
    // should be the const user = response.data;

    // useEffect(() => {
    //     getUser();
    // })

    const handleLike = () => {
        setLiked((prev) => !prev);
    }

    return (
        <>
            <div className={CLASSNAME}>
                <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                        {user.photos.map((photo, index) => {
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
            </div>
            <div className={`${CLASSNAME}__informations`}>
                <div onClick={handleLike} className='under-image'>
                    {liked === true ? (
                        <img className={`${CLASSNAME}__swipe-heart`} src='/like-dark-border.png' alt='' />

                    ) : (
                        <img className={`${CLASSNAME}__swipe-heart`} src='/like-white.png' alt='' />
                    )}
                </div>
                <p className={`${CLASSNAME}__informations-username`}>{user.username}, {user.age}</p>
                <div className={`${CLASSNAME}__informations-location`}>
                    <img className={`${CLASSNAME}__informations-location-icon`} src='/alternate-map-marker.svg' alt='' />
                    <p className={`${CLASSNAME}__informations-location-text`}>{user.location}</p>
                </div>
                <StarRating rate={user.fame_rating} />
                <p className={`${CLASSNAME}__informations-bio`}>{user.biography}</p>
                <div className={`${CLASSNAME}__interests`}>
                    {user.interests.map((interest, index) => (
                        <span key={index} className={`${CLASSNAME}__tag`}>{interest}</span>
                    ))}
                </div>
            </div>
        </>
    );
}

export default ProfileView;