'use client'

import React, { useState } from 'react';
import { useAuth } from '@/app/authContext';
import Button from '../../core/button/button';
import Link from 'next/link';

import './reset-password.scss'

const CLASSNAME = 'reset-password'

const ResetPasswordPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidUsername, setIsValidUsername] = useState(false);
    const [updateMessage, setUpdateMessage] = useState(false);
    const { user } = useAuth();

    const submitUsername = async (event: any) => {
        event.preventDefault();
        if (username === '1') {
            setIsValidUsername(true);
        }
        // try {
        // 	const response = await fetch(`http://${serverIP}:5000/auth/check-username`, {
        // 	  method: 'GET',
        // 	  headers: {
        // 		'Content-Type': 'application/json'
        // 	  },
        // 	  body: JSON.stringify(username)
        // 	});
        // } catch (e) {
        //     console.log(e);
        // }
        // if (response.ok) {
            // setIsValidUsername(true);
        // }
    }
    const submitPassword = async (event: any) => {
        event.preventDefault();
        const payload = {
            username,
            password,
            confirmPassword,
        }
        if (password === '1') {
            setUpdateMessage(true);
        }
        // try {
        // 	const response = await fetch(`http://${serverIP}:5000/auth/reset-password`, {
        // 	  method: 'GET',
        // 	  headers: {
        // 		'Content-Type': 'application/json'
        // 	  },
        // 	  body: JSON.stringify(payload)
        // 	});
        // } catch (e) {
        //     console.log(e);
        // }
        // if (response.ok) {
        //     setUpdateMessage(true);
        // }
    }
    return (
        <>
            {!isValidUsername &&
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
                        <Button title="continue" type="submit" onClick={() => { }} />
                        <div className={`${CLASSNAME}__helper`}>
                            <p className={`${CLASSNAME}__helper-question`}>Not a member yet ?</p>
                            <Link className={`${CLASSNAME}__helper-link`} href="/register">
                                Register!
                            </Link>
                        </div>
                    </form>
                </div>}
            {isValidUsername &&
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
                        <Button title="continue" type="submit" onClick={() => { }} />
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