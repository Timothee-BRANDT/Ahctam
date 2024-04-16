'use client'

import Link from "next/link";
import { useState } from "react";
import './index.scss'

export default function Page() {
  const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

  const submit = async (event: any) => {
    event.preventDefault();

  }
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
        </form>
      </div>
    </>
  );
}