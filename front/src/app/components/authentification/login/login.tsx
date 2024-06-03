'use client'

import React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/authContext';
import { State } from '@/app/types';
import Button from '@/app/components/core/button/button';
import { useRouter } from 'next/navigation';

import './login.scss'

// PERSONNAL DOC, I'M USING PASSWORD_HASH TO HANDLE ALL THE DIFFERENTS USE CASES
// 1 => Log for the first time, redirect to information page
// 2 => Log but not the first time, just setJwt and user
// 3 => Bad credentials

const Login: React.FC = () => {
	const router = useRouter();
	const {login, logout, isJwtInCookie, user, setUser } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [ status, setStatus ] = useState<State>(State.initial);
	const [ isBadCredentials, setIsBadCredentials] = useState<boolean>(false);

	useEffect(() => {
		if (status == State.initial && !user?.username && isJwtInCookie('jwtToken')) {
			// CALL ENDPOINT TO GET THE USER INFORMATIONS
			// GET METHOD WITH THE JWT IN HEADER
			// FOR NOW myPIG IS A MOCK :D
			const myPig = {
				id: 12,
				username: 'Julie',
				firstname: 'Brandt',
				lastname: 'Juju',
				email: email,
				password: password,
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
	  }, [user]);

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



		// if the user is logged for the first time;
		if (password === '1') {
			setStatus(State.redirect)
			const myPig = {
				id: 12,
				username: 'JuJu',
				firstname: 'Julie',
				lastname: 'Juliette',
				email: email,
				password: password,
				confirmPassword: password,
				is_active: true,
				registration_token: 'qwertyuiop',
				jwt_token: '123456789asdsfgbvncxvbn',
				gender: '',
				sexual_preferences: '',
				biography: '',
				interests: '',
				created_at: '1234567876543',
				firstTimeLogged: true,
			}
			router.push('/informations');
			setUser(myPig);
			login(myPig);
		}

		// 2) logged success from API, but not the first time
		if (password === '2') {
			const myPig = {
				id: 12,
				username: 'JuJu',
				firstname: 'Julie',
				lastname: 'Juliette',
				email: email,
				password: password,
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
			router.push('/profile');
			setUser(myPig);
			login(myPig);
		}

		// 3) bad credentials 
		if (password === '3') {
			setIsBadCredentials(true)
			setTimeout(() => {
				setIsBadCredentials(false);
			}, 2000);
		}

		// 4) ERROR FROM THE API CALL
		// } catch (error) {
		// 	console.error('Error sending data to the server:', error);
		// }
		};
  return (
	<>
		{isBadCredentials && <p className="bad-credentials">Bad credentials</p>}
		{!user.firstname &&
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
							Register!
						</Link>
					</div>
			</form>
		</div>}
	</>
  );
}

export default Login;