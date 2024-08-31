"use client";
import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import RootLayout from "../layout";
import FirstLoginPage from "../components/firstLoginForm";

export default function FirstLoginFormular() {
  return (
    <>
      <Header />
      <FirstLoginPage />
      <Footer />
    </>
  );
}

FirstLoginFormular.layout = RootLayout;
