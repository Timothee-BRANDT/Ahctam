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

const CLASSNAME = 'carousel';

const ProfileView: React.FC = () => {
    const { user } = useAuth();

    return (
        <>
            <div className="carousel">
                <Carousel className="w-full max-w-xs">
                    <CarouselContent>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <Card>
                                        <CardContent className="flex aspect-square items-center justify-center p-6 custo">
                                            <img className={`${CLASSNAME}__image`} src={data.user.photos[index]} alt='' />
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