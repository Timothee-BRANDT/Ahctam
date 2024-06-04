import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import RegisterForm from '../components/authentification/register/registerForm';
import RootLayout from '../layout';

export default function Register() {
  return (
    <>
        <Header />
        <RegisterForm />
        <Footer />
    </>
  );
}

Register.layout = RootLayout;