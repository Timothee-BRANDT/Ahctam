'use client'

import React, { useContext, useEffect } from 'react';
import { useAuth } from '../../authContext';
import Link from 'next/link';
import "./header.scss"
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const Header: React.FC = () => {
    const router = useRouter();
    const { logout, user } = useAuth();
    const redirectHome = () => {
        router.push('/');
    }
    const redirectProfile = () => {
        router.push('/profile/update');
    }
    const redirectSearch = () => {
        router.push('/search');
    }
    const redirectFavorites = () => {
        router.push('/favorites');
    }
    const redirectHistory = () => {
        router.push('/history');
    }
    const redirectLogin = () => {
        router.push('/login');
    }
    function toggleMenu() {
        const navLinks = document.querySelector('.navLinks');
        if (navLinks) {
            navLinks.classList.toggle('show');
        }
    }

    return (
        <header className="header">
            <img className="logo" src="/logo.svg" alt="logo" />
            <nav>
                <ul className="navLinks">
                    {user.jwt_token && <Button onClick={redirectHome}>Home</Button>}
                    {user.jwt_token && <Button onClick={redirectProfile}>Profile</Button>}
                    {user.jwt_token && <Button onClick={redirectSearch}>Search</Button>}
                    {user.jwt_token && <Button onClick={redirectHistory}>History</Button>}
                    {user.jwt_token && <Button onClick={redirectFavorites}>Favorites</Button>}
                    {user.jwt_token && <Button onClick={logout}>Logout</Button>}
                </ul>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="menuButton" onClick={toggleMenu}>Menu</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                            <Button title="Home" onClick={redirectHome} className="home" />
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {user.jwt_token && <Button onClick={redirectProfile}>Profile</Button>}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {user.jwt_token && <Button onClick={redirectSearch}>Search</Button>}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {user.jwt_token && <Button onClick={logout}>Logout</Button>}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {user.jwt_token && <Button onClick={redirectHistory}>History</Button>}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {user.jwt_token && <Button onClick={redirectFavorites}>Favorites</Button>}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </nav>
        </header>
    );
}

export default Header;