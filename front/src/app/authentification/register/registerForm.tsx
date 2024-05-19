'use client'

import React from 'react';
import { useEffect, useState } from 'react';
import './registerForm.scss'
import Link from 'next/link';
import { State } from '../../types';
import { useAuth } from '../../authContext';
import Button from '../../components/button';

const RegisterForm: React.FC = () => {
	const {login, logout, isJwtInCookie, user, setUser } = useAuth();
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [lastname, setLastname] = useState('');
	const [firstname, setFirstname] = useState('');
	const [password, setPassword] = useState('');
	const [ status, setStatus ] = useState<State>(State.initial);
	const [ isBadCredentials, setIsBadCredentials] = useState<boolean>(false);
	
	const submit = async (event: any) => {
		event.preventDefault();

		// ************ LOGIC TO MAKE THE LOGIN API CALL ************** //
		// const url = '/api/login';
		// const payload = {
		// 	email: email,
        //  username: username,
        //  lastname: lastname,
        //  firstname: firstname,
		// 	password: password
		// };
		// try {
		// 	const response = await fetch(url, {
		// 	  method: 'POST',
		// 	  headers: {
		// 		'Content-Type': 'application/json'
		// 	  },
		// 	  body: JSON.stringify(payload)
		// 	});
	  
		// 	if (!response.ok) {
		// 	  throw new Error('Network response was not ok');
		// 	}
	  
		// 	const data = await response.json();
		// 	console.log('Server response:', data);
		// 1) log success, response is a JSON with the user info, mock the api response with myPig
		// mocked data from the API response
		const myPig = {
			id: 12,
			userName: username,
			firstName: firstname,
			lastName: lastname,
			email: email,
			password_hash: password,
			is_active: true,
			registration_token: 'qwertyuiop',
			jwt_token: '123456789asdsfgbvncxvbn',
			gender: 'female',
			sexual_preferences: 'male',
			biography: 'osef',
			interests: 'osef',
			created_at: '1234567876543',
			firstTimeLogged: true,
		}
		setUser(myPig);
		login(myPig);
		// 2) ERROR FROM THE API CALL
		// } catch (error) {
		// 	console.error('Error sending data to the server:', error);
		// }
		// 3) log failed, JSON with a logFailed value
		// setIsBadCredentials(true)
		// setTimeout(() => {
		// 	setIsBadCredentials(false);
		//   }, 2000);
		};
  return (
	<>
		<div className="form-container">
			<form onSubmit={submit} className="form">
				<div>
					<label htmlFor="email">Email</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						autoComplete="new-password"
					/>
				</div>
				<div>
					<label>Username</label>
					<input
						type="username"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						autoComplete="new-password"
					/>
				</div>
                <div>
					<label>Last Name</label>
					<input
						type="last-name"
						id="last-name"
						value={lastname}
						onChange={(e) => setLastname(e.target.value)}
						required
						autoComplete="new-password"
					/>
				</div>
                <div>
					<label>First Name</label>
					<input
						type="first-name"
						id="first-name"
						value={firstname}
						onChange={(e) => setFirstname(e.target.value)}
						required
						autoComplete="new-password"
					/>
				</div>
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