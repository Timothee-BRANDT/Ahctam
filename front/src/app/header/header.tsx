'use client'

import React, { useContext } from 'react';
import { useAuth } from '../authContext';
import Link from 'next/link';

import "./header.scss"

const Header: React.FC = () => {
  const { logout, user } = useAuth();
  return (
    <header className="header">
      <p>Guinea Pig Dating Site</p>
      <nav>
        <ul className="navLinks">
          <li className={user.firstName ? "home-button-user-logged-in" : "home-button-user-logged-out"}>
            <Link href="/">
              Home
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;