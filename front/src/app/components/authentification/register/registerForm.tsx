'use client'

import React from 'react';
import { useState } from 'react';
import './registerForm.scss'
import Link from 'next/link';
import Button from '../../core/button/button';
import { serverIP } from '@/app/constants';
import { State } from '@/app/types';

const RegisterForm: React.FC = () => {
	const [status, setStatus] = useState<State>(State.initial)
	const [payload, setPayload] = useState({
		email: '',
		username: '',
		lastname: '',
		firstname: '',
		password: '',
		confirmPassword: '',
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
				setStatus(State.redirect);
			}
		}
		catch (e) {
			throw new Error('An error occured while attenmp to register');
		}
	}
  return (
	<>
		{status === State.initial ? (
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
						<label htmlFor="confirmPassword">Confirm Password</label>
						<input
							type="password"
							name="confirmPassword"
							value={payload.confirmPassword}
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
		) : (
			<>
				<div>THANKS FOR SIGNING UP.</div>
				<div>AN VERIFICATION EMAIL AS BEEN SENT TO {payload.email}</div>
				<div>LOGIN TO YOUR NEW ACCOUNT</div>
			</>
		)}
	</>
  );
}

export default RegisterForm;