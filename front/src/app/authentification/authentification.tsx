'use client'

import { useState } from 'react';
import './authentification.scss'
import Link from 'next/link';

const Authentification: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
  };
  return (
    <div className="form-container">
    <form onSubmit={handleSubmit} className="form">
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