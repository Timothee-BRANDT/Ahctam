'use client'

import React, { useEffect } from 'react';
import './registerConfirm.scss'
import { Button } from '@/components/ui/button';
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
            <Button onClick={redirectToLogin}>Login to your new account</Button>
            <Button onClick={redirectToRegister}>Create another account</Button>
        </div>
    );
}

export default RegisterForm;