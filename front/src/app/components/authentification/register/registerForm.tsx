'use client'

import React from 'react';
import { useState } from 'react';
import './registerForm.scss'
import Link from 'next/link';
import Button from '../../core/button/button';
import { serverIP } from '@/app/constants';
import { State } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/authContext';

const RegisterForm: React.FC = () => {
	const router =  useRouter();
	const { setUser } = useAuth();
	const [payload, setPayload] = useState({
		email: '',
		username: '',
		lastname: '',
		firstname: '',
		password: '',
		password2: '',
	})

	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setPayload({
		  ...payload,
		  [name]: value,
		});
	  };
	
	const submit = async (event: any) => {
		event.preventDefault();
		// if (payload.firstname === 'success') {
		// 	console.log(payload.email);
		// 	const user = {
		// 		id: 1,
		// 		username: payload.username,
		// 		firstname: payload.firstname,
		// 		lastname: payload.lastname,
		// 		email: payload.email,
		// 		password: payload.password,
		// 		confirmPassword: payload.confirmPassword,
		// 		is_active: false,
		// 		registration_token: '',
		// 		jwt_token: '',
		// 		gender: '',
		// 		sexual_preferences: '',
		// 		biography: '',
		// 		interests: '',
		// 		created_at: '',
		// 		firstTimeLogged: false,
		// 	}
		// 	setUser(user);
		// 	router.push('register-confirm')
		// 	return;
		// }
		try {
			const response = await fetch(`http://${serverIP}:5000/auth/register`, {
			  method: 'POST',
			  credentials: 'include',
			  headers: {
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify(payload)
			});
			if (response.ok) {
				const user = {
					id: 1,
					username: payload.username,
					firstname: payload.firstname,
					lastname: payload.lastname,
					email: payload.email,
					password: payload.password,
					password2: payload.password2,
					is_active: false,
					registration_token: '',
					jwt_token: '',
					gender: '',
					sexual_preferences: '',
					biography: '',
					interests: [],
                    photos: [],
					created_at: '',
					firstTimeLogged: false,
				}
				setUser(user);
				router.push('register-confirm')
			}
		}
		catch (e) {
			throw new Error('An error occured while attenmp to register');
		}
	}
  return (
	<>
		<div className="form-container">
			<form onSubmit={submit} className="form">
				<div>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						value={payload.email}
						name="email"
						onChange={handleChange}
						required
						autoComplete="new-password"
					/>
				</div>
				<div>
					<label htmlFor="userame">User Name</label>
					<input
						type="username"
						name="username"
						value={payload.username}
						onChange={handleChange}
						required
						autoComplete="new-password"
					/>
				</div>
				<div>
					<label htmlFor="lastname">Last Name</label>
					<input
						type="lastname"
						name="lastname"
						value={payload.lastname}
						onChange={handleChange}
						required
						autoComplete="new-password"
					/>
				</div>
				<div>
					<label htmlFor="firstname">First Name</label>
					<input
						type="first-name"
						name="firstname"
						value={payload.firstname}
						onChange={handleChange}
						required
						autoComplete="new-password"
					/>
				</div>
				<div>
					<label htmlFor="password">Password</label>
					<input
						type="password"
						name="password"
						value={payload.password}
						onChange={handleChange}
						required
						autoComplete="new-password"
					/>
				</div>
				<div>
					<label htmlFor="password2">Confirm Password</label>
					<input
						type="password2"
						name="password2"
						value={payload.password2}
						onChange={handleChange}
						required
						autoComplete="new-password"
					/>
				</div>
				<Button title="Register" type="submit" onClick={() => {}}/>
					<div className="new_member">
						<p className="new_member-question">Already have an Account ?</p>
						<Link className="new_member-creation" href="/">
							Login!
						</Link>
					</div>
			</form>
		</div>
	</>
  );
}

export default RegisterForm;