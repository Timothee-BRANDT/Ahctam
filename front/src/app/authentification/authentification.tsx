'use client'

import React from 'react';
import { useContext, useEffect, useState } from 'react';
import './authentification.scss'
import Link from 'next/link';
import { User } from '../types';
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
	logged: false,
};

const Authentification: React.FC = () => {
	// const [myUser, setMyUser] = useState<User>(initialPig);
	const {login, logout, setCookie, user, setUser } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		// console.log(isJwtToken('jwtToken'));
		console.log(user)
	  }, [user]);
	
	// FIRST THING TO DO -> CHECK IF A JWT TOKEN IS ALREADY SET, IF YES, CALL THE GETUSERINFORMATION ENDPOINT. NO LOG IN NECESSARY.
	// const isJwtToken = (name: string) => {
	// 	const cookies = document.cookie;
	// 	const cookieArray = cookies.split(';');
	  
	// 	for (let i = 0; i < cookieArray.length; i++) {
	// 	  const cookie = cookieArray[i].trim();
	// 	  if (cookie.startsWith(`${name}=`)) {
	// 		return true;
	// 	  }
	// 	}
	// 	return false;
	// }

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
			logged: true,
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
			// setCookie('jwtToken', myPig.jwt_token, 7);
		// // ERROR FROM THE API CALL
		// } catch (error) {
		// 	console.error('Error sending data to the server:', error);
		// }
		// 2) log failed, JSON with a logFailed value
		// Need a pop-up with "Bad credentials"
		// 
		};
  return (
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
  );
}

export default Authentification;