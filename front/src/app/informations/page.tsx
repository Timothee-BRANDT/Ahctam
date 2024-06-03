'use client'
import React from 'react';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import RootLayout from '../layout';
import InformationPage from '../components/informationPage';

export default function UserInformations() {

  return (
    <>
      <Header />
      <InformationPage />
      <Footer />
    </>
  );
};

UserInformations.layout = RootLayout;
