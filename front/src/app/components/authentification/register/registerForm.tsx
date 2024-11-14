"use client";

import React from "react";
import { useState } from "react";
import "./registerForm.scss";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { serverIP } from "@/app/constants";
import createRefreshClosure from "@/app/constants";
import { useRouter } from "next/navigation";

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [payload, setPayload] = useState({
    email: "",
    username: "",
    lastname: "",
    firstname: "",
    password: "",
    password2: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const submit = async (event: any) => {
    event.preventDefault();
    try {
      console.log("We are calling http://${serverIP}:5000/auth/register");
      const response = await fetch(`http://${serverIP}:5000/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      router.push("register-confirm");
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <>
      <div className="form-container">
        <form onSubmit={submit} className="form">
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              value={payload.email}
              name="email"
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="userame">User Name</label>
            <input
              type="username"
              name="username"
              value={payload.username}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="lastname">Last Name</label>
            <input
              type="lastname"
              name="lastname"
              value={payload.lastname}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="firstname">First Name</label>
            <input
              type="first-name"
              name="firstname"
              value={payload.firstname}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={payload.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={payload.password2}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" onClick={() => {}}>
            Register
          </Button>
          <div className="new_member">
            <p className="new_member-question">Already have an Account ?</p>
            <Link className="new_member-creation" href="/login">
              Login!
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default RegisterForm;
