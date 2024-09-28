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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const router = useRouter();
  const { logout, user, isJwtInCookie } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const redirectHome = () => {
    router.push("/");
  };
  const redirectProfile = () => {
    router.push("/profile/update");
  };
  const redirectBrowse = () => {
    router.push("/browse");
  };
  const redirectSearch = () => {
    router.push("/search");
  };
  const redirectFavorites = () => {
    router.push("/fans");
  };
  const redirectHistory = () => {
    router.push("/history");
  };
  function toggleMenu() {
    const navLinks = document.querySelector(".navLinks");
    if (navLinks) {
      navLinks.classList.toggle("show");
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
