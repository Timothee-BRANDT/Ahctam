'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/authContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import './reset-password.scss'
import { serverIP } from '@/app/constants';

const CLASSNAME = 'reset-password'

const ResetPasswordPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidUsername, setIsValidUsername] = useState(false);
    const [isTokenInURL, setIsTokenInURL] = useState(false);
    const [token, setToken] = useState('');
    const [updateMessage, setUpdateMessage] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const finalToken = query.get('token');
        if (finalToken) {
            setIsTokenInURL(true);
            setToken(finalToken);
        }
    }, [])

    const submitUsername = async (event: any) => {
        event.preventDefault();
        // [MOCK]
        if (username === '1') {
            setIsValidUsername(true);
        }
        try {
            const response = await fetch(`http://${serverIP}:5000/auth/checkUsername`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(username)
            });
            if (response.ok) {
                setIsValidUsername(true);
            }
        } catch (e) {
            console.log(e);
        }
    }
    const submitPassword = async (event: any) => {
        event.preventDefault();
        const payload = {
            username,
            password,
            confirmPassword,
            token,
        }
        if (password === '1') {
            setUpdateMessage(true);
        }
        try {
            const response = await fetch(`http://${serverIP}:5000/auth/resetPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                setUpdateMessage(true);
            }
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <>
            {!isValidUsername && !isTokenInURL &&
                <div className={`${CLASSNAME}__form-container`}>
                    <div className={`${CLASSNAME}__first-message`}>
                        Enter the username associated with your account
                        and we'll send you a link to reset your password.
                    </div>
                    <form onSubmit={submitUsername} className="form">
                        <div>
                            <label htmlFor="text">Username</label>
                            <input
                                type="text"
                                id="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <Button type="submit" onClick={() => { }}>Continue</Button>
                        <div className={`${CLASSNAME}__helper`}>
                            <p className={`${CLASSNAME}__helper-question`}>Not a member yet ?</p>
                            <Link className={`${CLASSNAME}__helper-link`} href="/register">
                                Register!
                            </Link>
                        </div>
                    </form>
                </div>}
            {isValidUsername && (
                <div className={`${CLASSNAME}__form-container`}>
                    <div className={`${CLASSNAME}__first-message`}>
                        An email has been sent to the user {username}
                    </div>
                    <Link className={`${CLASSNAME}__helper-link`} href="/">
                        Login !
                    </Link>
                </div >
            )}
            {isTokenInURL &&
                <div className={`${CLASSNAME}__form-container`}>
                    <div className={`${CLASSNAME}__first-message`}>
                        You can now create a new password for your account !
                    </div>
                    <form onSubmit={submitPassword} className="form">
                        <div>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                            <label htmlFor="password">Confirm Password</label>
                            <input
                                type="password"
                                id="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <Button type="submit" onClick={() => { }}>Continue</Button>
                        <div className={`${CLASSNAME}__helper`}>
                            <p>Remember your password ?</p>
                            <Link className={`${CLASSNAME}__helper-link`} href="/">
                                Login !
                            </Link>
                        </div>
                        {updateMessage && (
                            <div className={`${CLASSNAME}__helper`}>
                                <p className={`${CLASSNAME}__helper-password-updated`}>Your password has been updated !</p>
                                <Link className={`${CLASSNAME}__helper-link`} href="/">
                                    Login !
                                </Link>
                            </div>
                        )}
                    </form>
                </div>
            }
        </>
    );
}

export default ResetPasswordPage;