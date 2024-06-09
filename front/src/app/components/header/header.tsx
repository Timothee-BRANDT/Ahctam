'use client'

import React, { useContext, useEffect } from 'react';
import { useAuth } from '../../authContext';
import Link from 'next/link';
import "./header.scss"
import Button from '@/app/components/core/button/button';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
    const router = useRouter();
    const { logout, user } = useAuth();
    const redirectHome = () => {
        router.push('/');
    }
    const redirectProfile = () => {
        router.push('/profile/update');
    }
    const redirectLogin = () => {
        router.push('/login');
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
            </nav>
        </header>
    );
}

export default Header;