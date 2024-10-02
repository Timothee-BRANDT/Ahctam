'use client'

import React, { useContext, useEffect, useState } from 'react';
import { useAuth } from '../../authContext';
import Link from 'next/link';
import "./header.scss"
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { serverIP } from '@/app/constants';

export interface Notification {
    image: string;
    message: string;
}

const Header: React.FC = () => {
    const router = useRouter();
    const { logout, user, isJwtInCookie, getCookie } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const redirectHome = () => {
        router.push('/');
    }
    const redirectProfile = () => {
        router.push('/profile/update');
    }
    const redirectSearch = () => {
        router.push('/browse');
    }
    const redirectFavorites = () => {
        router.push('/fans');
    }
    const redirectHistory = () => {
        router.push('/history');
    }

    const fetchNotifications = async () => {
        const token = getCookie("jwt_token");
        const response = await fetch(`http://${serverIP}:5000/api/getMyNotifs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data_response = await response.json();
        // MOCK
        // setNotifications([{
        //     image: "final1.svg",
        //     message: "Lolmapoule",
        // }, {
        //     image: "final1.svg",
        //     message: "Ceci est une notification",
        // }])
        if (data_response.length) {
            setNotifications(data_response);
        }
        const navLinks = document.querySelector('.navLinks');
        if (navLinks) {
            navLinks.classList.toggle('show');
        }
    }

    const handleBellClick = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        setIsLoggedIn(isJwtInCookie());
    }, []);

    return (
        <>
            <header className="header">
                <img className="logo" src="/logo.svg" alt="logo" />
                {isLoggedIn && (
                    <nav>
                        <ul className="navLinks">
                            <DropdownMenu open={isOpen} onOpenChange={handleBellClick}>
                                <DropdownMenuTrigger asChild>
                                    <div className="bell_desktop" >
                                        <img className="bell" src='/bell.jpg' alt='Bell Icon' />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 bg-white shadow-lg rounded-lg p-4">
                                    <div className="text-lg font-semibold mb-2">Notifications</div>
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, index) => (
                                            <div key={index} className="flex items-center py-2 border-b border-gray-200 last:border-none">
                                                <img
                                                    src={notif.image}
                                                    alt="Avatar"
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                                <div className="text-sm">
                                                    <p>{notif.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500">Aucune notification pour le moment</div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" onClick={redirectHome}>Home</Button>
                            <Button size="sm" onClick={redirectSearch}>Browse</Button>
                            <Button size="sm" onClick={redirectHistory}>History</Button>
                            <Button size="sm" onClick={redirectFavorites}>Fans</Button>
                            <Button size="sm" onClick={redirectProfile}>Profile</Button>
                            <Button size="sm" onClick={logout}>Logout</Button>
                        </ul>
                        <div className="responsive-header">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="menuButton" >
                                        <img className="bell_responsive" src='/bell.jpg' alt='' />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 bg-white shadow-lg rounded-lg p-4">
                                    <div className="text-lg font-semibold mb-2">Notifications</div>
                                    {notifications.length > 0 ? (
                                        notifications.map((notif, index) => (
                                            <div key={index} className="flex items-center py-2 border-b border-gray-200 last:border-none">
                                                <img
                                                    src={notif.image}
                                                    alt="Avatar"
                                                    className="w-10 h-10 rounded-full mr-3"
                                                />
                                                <div className="text-sm">
                                                    <p>{notif.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500">Aucune notification pour le moment</div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="menuButton" >
                                        <img src="/menu.svg" alt="menu-icon"></img>
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuItem>
                                        <Button className="w-full" onClick={redirectHome}>Home</Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button className="w-full" onClick={redirectSearch}>Browse</Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button className="w-full" onClick={redirectProfile}>Profile</Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button className="w-full" onClick={logout}>Logout</Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button className="w-full" onClick={redirectHistory}>History</Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button className="w-full" onClick={redirectFavorites}>Favorites</Button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </nav>
                )}
            </header>
        </>
    );
}

export default Header;