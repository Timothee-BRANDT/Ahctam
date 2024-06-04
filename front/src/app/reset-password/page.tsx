import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import RootLayout from '../layout';
import ResetPasswordPage from '../components/authentification/reset-password/reset-password';

export default function ResetPassword() {
  return (
    <>
        <Header />
        <ResetPasswordPage />
        <Footer />
    </>
  );
}

ResetPassword.layout = RootLayout;