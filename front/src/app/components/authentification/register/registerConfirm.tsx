'use client'

import React from 'react';
import './registerConfirm.scss'
import Button from '../../core/button/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/authContext';

const RegisterForm: React.FC = () => {
	const router =  useRouter();
	const  { user } = useAuth();

  console.log(user);
	
	const redirectToLogin = () => {
		router.push('/')
	}
	const redirectToRegister = () => {
		router.push('/register')
	}
  return (
        <div className="confirm-registration">
            <div>Thanks for signing up.</div>
            <div>A verification email as been sent to {user.email}</div>
            <Button title="Login to your new account" onClick={redirectToLogin} />
            <Button title="Create another account" onClick={redirectToRegister} />
        </div>
  );
}

export default RegisterForm;