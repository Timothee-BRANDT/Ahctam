'use client'

import React, { useEffect } from 'react';
import './registerConfirm.scss'
import Button from '../../core/button/button';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/authContext';

const CLASSNAME = 'confirm-registration'

const RegisterForm: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    useEffect(() => {
        if (pathname !== '/login' && !user.jwt_token)
            redirectToLogin();
    })

    const redirectToLogin = () => {
        router.push('/login');
    }

    const redirectToRegister = () => {
        router.push('/register')
    }
    return (
        <div className={CLASSNAME}>
            <div className={`${CLASSNAME}__message`}>Thanks for signing up.</div>
            <div className={`${CLASSNAME}__message`}>A verification email has been sent to {user.email}.</div>
            <Button title="Login to your new account" onClick={redirectToLogin} />
            <Button title="Create another account" onClick={redirectToRegister} />
        </div>
    );
}

export default RegisterForm;