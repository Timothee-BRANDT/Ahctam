'use client'

import React, { useContext } from 'react';
import { useAuth } from '../authContext';
import Link from 'next/link';

import "./header.scss"
import Button from '../components/button';

const Header: React.FC = () => {
  const { logout, user } = useAuth();
  return (
    <header className="header">
      <p>PiggyDate</p>
      <nav>
        <ul className="navLinks">
          <li className={"home"} >
            <Link href="/">
              Home
            </Link>
          </li>
          {user.firstName && <Button title="Logout" onClick={logout} />}
        </ul>
      </nav>
    </header>
  );
}

export default Header;