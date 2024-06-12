'use client'

import React, { useContext, useEffect } from 'react';
import { useAuth } from '../../authContext';
import Link from 'next/link';
import "./header.scss"
import Button from '@/app/components/core/button/button';
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
    const redirectLikes = () => {
        router.push('/theyLikesMe');
    }
    const redirectSaw = () => {
        router.push('/theySawMe');
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
            <p>PiggyDate</p>
            <nav>
                <ul className="navLinks">
                    <Button title="Home" onClick={redirectHome} className="home" />
                    {user.jwt_token && <Button title="Profile" onClick={redirectProfile} />}
                    {user.jwt_token && <Button title="Logout" onClick={logout} />}
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
                            {user.jwt_token && <Button title="Profile" onClick={redirectProfile} />}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            {user.jwt_token && <Button title="Logout" onClick={logout} />}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </nav>
        </header>
    );
}

export default Header;