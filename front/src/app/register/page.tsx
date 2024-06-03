import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import { AuthProvider } from '../authContext';
import RegisterForm from '../components/authentification/register/registerForm';

export default function Register() {
  return (
    <AuthProvider>
      <main>
        <Header />
        <RegisterForm />
        <Footer />
      </main>
    </AuthProvider>
  );
}