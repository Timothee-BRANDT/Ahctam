"use client";

import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import Link from "next/link";
import "./header.scss";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { serverIP } from '@/app/constants';

export interface Notification {
    image: string;
    message: string;
}

const Header: React.FC = () => {
    const router = useRouter();
    const { logout, user, isJwtInCookie, getCookie } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const redirectHome = () => {
        router.push('/');
    }
    const redirectProfile = () => {
        router.push('/profile/update');
    }
    const redirectSearch = () => {
        router.push('/browse');
    }
    const redirectFavorites = () => {
        router.push('/fans');
    }
    const redirectHistory = () => {
        router.push('/history');
    }

    const fetchNotifications = async () => {
        const token = getCookie("jwt_token");
        const response = await fetch(`http://${serverIP}:5000/api/getMyNotifs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const data_response = await response.json();
        // MOCK
        // setNotifications([{
        //     image: "final1.svg",
        //     message: "Lolmapoule",
        // }, {
        //     image: "final1.svg",
        //     message: "Ceci est une notification",
        // }])
        if (data_response.length) {
            setNotifications(data_response);
        }
        const navLinks = document.querySelector('.navLinks');
        if (navLinks) {
            navLinks.classList.toggle('show');
        }
    }
  }

  useEffect(() => {
    setIsLoggedIn(isJwtInCookie());
  }, []);

  // CLOCHE DANS LE HEADER POUR LES NOTIFS
  // CALL ENDPOINT QUI RENVOIE LA LISTE DES NOTIFS

  return (
    <>
      <header className="header">
        <img className="logo" src="/logo.svg" alt="logo" />
        {isLoggedIn && (
          <nav>
            <ul className="navLinks">
              <Button onClick={redirectHome}>Home</Button>
              <Button onClick={redirectBrowse}>Browse</Button>
              <Button onClick={redirectSearch}>Search</Button>
              <Button onClick={redirectHistory}>History</Button>
              <Button onClick={redirectFavorites}>Fans</Button>
              <Button onClick={redirectProfile}>Profile</Button>
              <Button onClick={logout}>Logout</Button>
            </ul>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="menuButton" onClick={toggleMenu}>
                  <img src="/menu.svg" alt="menu-icon"></img>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem>
                  <Button className="w-full" onClick={redirectHome}>
                    Home
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full" onClick={redirectBrowse}>
                    Browse
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full" onClick={redirectSearch}>
                    Search
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full" onClick={redirectProfile}>
                    Profile
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full" onClick={logout}>
                    Logout
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full" onClick={redirectHistory}>
                    History
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button className="w-full" onClick={redirectFavorites}>
                    Favorites
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
