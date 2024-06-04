import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import RegisterConfirm from '../components/authentification/register/registerConfirm';
import RootLayout from '../layout';

export default function RegisterConfirmLayout() {
  return (
    <>
        <Header />
        <RegisterConfirm />
        <Footer />
    </>
  );
}

RegisterConfirmLayout.layout = RootLayout;