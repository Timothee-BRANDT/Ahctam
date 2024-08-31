"use client";
import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import RootLayout from "../layout";
import FirstLoginPage from "../components/firstLoginForm";

export default function FirstLoginFormular() {
  return (
    <>
      <header>
        <h1
          style={{
            textAlign: "center",
            fontSize: "1.2rem",
            fontWeight: "bolder",
          }}
        >
          Welcome to Matcha, please fill in the following form to complete your
          registration
        </h1>
      </header>
      <FirstLoginPage />
      <Footer />
    </>
  );
}

FirstLoginFormular.layout = RootLayout;
