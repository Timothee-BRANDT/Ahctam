'use client'

import React, { useContext } from 'react';
import { useAuth } from '../authContext';
import Link from 'next/link';

import "./header.scss"

const Header: React.FC = () => {
  const { logout } = useAuth();
  return (
    <header className="header">
      <p>Guinea Pig Dating Site</p>
      <nav>
        <ul className="navLinks">
          <li>
            <Link href="/">
              Home
            </Link>
          </li>
          <button onClick={logout}>Logout</button>
        </ul>
      </nav>
    </header>
  );
}

export default Header;