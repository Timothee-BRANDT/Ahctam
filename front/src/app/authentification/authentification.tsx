'use client'

import React from 'react';
import { useEffect, useState } from 'react';
import './authentification.scss'
import Link from 'next/link';
import { State } from '../types';
import { useAuth } from '../authContext';
import Button from '../components/button';

const Authentification: React.FC = () => {
	const {login, logout, isJwtInCookie, user, setUser } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [ status, setStatus ] = useState<State>(State.initial);
	const [ isBadCredentials, setIsBadCredentials] = useState<boolean>(false);

	useEffect(() => {
		if (status == State.initial && !user?.userName && isJwtInCookie('jwtToken')) {
			// CALL ENDPOINT TO GET THE USER INFORMATIONS
			// GET METHOD WITH THE JWT IN HEADER
			// FOR NOW myPIG IS A MOCK :D
			const myPig = {
				id: 12,
				userName: 'Julie',
				firstName: 'Brandt',
				lastName: 'Juju',
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
				firstTimeLogged: false,
			}
			setUser(myPig);
			login(myPig);
		}
		setStatus(State.done)
	  }, []);
	
	const submit = async (event: any) => {
		event.preventDefault();

		// ************ LOGIC TO MAKE THE LOGIN API CALL ************** //
		// const url = '/api/login';
		// const payload = {
		// 	email: email,
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
			userName: 'JuJu',
			firstName: 'Julie',
			lastName: 'Juliette',
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
		{isBadCredentials && <p className="bad-credentials">Bad credentials</p>}
		{!user.firstName && status != State.initial ? (
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
				<Button title="Log in" type="submit" onClick={() => {}}/>
					<div className="new_member">
						<p className="new_member-question">Not a member yet ?</p>
						<Link className="new_member-creation" href="/register">
							Create an account
						</Link>
					</div>
			</form>
		</div>
		) : (
			<>
				{user?.firstName && <div className="user-card">
					<p>Welcome {user?.firstName}</p>
					<img className="profile-picture" src="https://cdn4.volusion.store/kapts-nrbqf/v/vspfiles/photos/GUINEAPIGONEDRESSED-2.jpg?v-cache=1590745950"></img>
					<Button title="Logout" className="button-logout" onClick={logout} />
				</div>}
			</>
		)}
	</>
  );
}

export default Authentification;