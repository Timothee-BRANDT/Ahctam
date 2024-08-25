"use client";

import React, { useRef } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/authContext";
import { State } from "@/app/types";
import { Button } from "@/components/ui/button";
import { initializeSocket } from "@/app/sockets";
import { useRouter } from "next/navigation";
import data from "../../../api.json";

import "./login.scss";
import { serverIP } from "@/app/constants";

const CLASSNAME = "login";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isJwtInCookie, user, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isBadCredentials, setIsBadCredentials] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsLoggedIn(isJwtInCookie());
  }, [user]);

  const submit = async (event: any) => {
    event.preventDefault();
    const payload = {
      username,
      password,
    };
    try {
      const response = await fetch(`http://${serverIP}:5000/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.error === "Invalid credentials") {
          setIsBadCredentials(true);
          setTimeout(() => {
            setIsBadCredentials(false);
          }, 2000);
        }
        throw new Error("Network response was not ok");
      }
      setUser({
        ...user,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        id: data.user_id,
      });
      login(data.jwt_token);

      if (data.message === "First login") {
        router.push("/profile/update");
      } else {
        const socket = initializeSocket(data.jwt_token);
        router.push("/");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {isBadCredentials && (
        <p className={`${CLASSNAME}__bad-credentials`}>Bad credentials</p>
      )}
      {!isLoggedIn && (
        <div className={`${CLASSNAME}__form-container`}>
          <form onSubmit={submit} className="form">
            <div>
              <label htmlFor="text">Username</label>
              <input
                ref={inputRef}
                type="text"
                id="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <Button type="submit" onClick={() => {}}>
              Log in
            </Button>
            <div className={`${CLASSNAME}__helper`}>
              <p className={`${CLASSNAME}__helper-question`}>
                Password forgot ?
              </p>
              <Link
                className={`${CLASSNAME}__helper-link`}
                href="/reset-password"
              >
                Send me a link !
              </Link>
            </div>
            <div className={`${CLASSNAME}__helper`}>
              <p className={`${CLASSNAME}__helper-question`}>
                Not a member yet ?
              </p>
              <Link className={`${CLASSNAME}__helper-link`} href="/register">
                Register!
              </Link>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default LoginPage;
