'use client'

import React from 'react';
import { useContext, useEffect, useState } from 'react';
import './authentification.scss'
import Link from 'next/link';
import { User, State } from '../types';
import { useAuth } from '../authContext';

const initialPig: User = {
	id: 1,
	userName: '',
	firstName: '',
	lastName: '',
	email: '',
	password_hash: '',
	is_active: false,
	registration_token: '',
	jwt_token: '',
	gender: '',
	sexual_preferences: '',
	biography: '',
	interests: '',
	created_at: '',
};

const Authentification: React.FC = () => {
	// const [myUser, setMyUser] = useState<User>(initialPig);
	const {login, logout, setCookie, deleteCookie, isJwtInCookie, user, setUser } = useAuth();
	// const [ isUserLogged, setIsUserLogged ] = useState<boolean>(false);
	const [ status, setStatus ] = useState<State>(State.initial);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		console.log('rwetyu')
		if (status == State.initial && !user?.userName && isJwtInCookie('jwtToken')) {
			console.log("IN THE IF")
			// setIsUserLogged(true);
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
			}
			setUser(myPig);
			login(myPig);
		}
		// else {
		// 	setIsUserLogged(false);
		// }
		setStatus(State.done)
	  }, []);
	
	const submit = async (event: any) => {
		event.preventDefault();
		// mocked data from the API response
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
		}
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
			setUser(myPig);
			login(myPig);
			// setIsUserLogged(true);
		// 2) ERROR FROM THE API CALL
		//  setIsUserLogged(false);
		// } catch (error) {
		// 	console.error('Error sending data to the server:', error);
		// }
		// 2) log failed, JSON with a logFailed value
		// Need a pop-up with "Bad credentials"
		// 
		};
  return (
	<>
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
				<button type="submit">Log in</button>
					<div className="link">
						<Link className="new-account" href="/register">
							Create an account
						</Link>
					</div>
			</form>
		</div>
		) : (
			status != State.initial && (
				<>
					<p>Welcome {user?.firstName}</p>
					<button onClick={logout}>Logout</button>
				</>
			)
		)}
	</>
  );
}

export default Authentification;