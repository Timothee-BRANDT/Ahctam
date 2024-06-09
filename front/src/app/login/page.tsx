import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import LoginPage from '../components/authentification/login/login';

export default function Login() {
  return (
    <>
        <Header />
        <LoginPage />
        <Footer />
    </>
  );
}

Login.layout = Login;