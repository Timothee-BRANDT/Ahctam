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

interface ProfileViewProps {
    id: string | string[];
}

const CLASSNAME = 'carousel';

const ProfileView: React.FC<ProfileViewProps> = (id) => {

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

    const user = data.user; // mock
    // should be the const user = response.data;

    // useEffect(() => {
    //     getUser();
    // })

    return (
        <>
            <div className="carousel">
                <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                        {user.photos.map((photo, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex aspect-square items-center justify-center p-6 custo">
                                            <img className={`${CLASSNAME}__image`} src={photo} alt='user-photo' />
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
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
        </>
    );
}

export default ProfileView;