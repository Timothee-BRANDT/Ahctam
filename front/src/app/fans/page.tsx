import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import RootLayout from '../layout';
import FansPage from '../components/fansPage/fansPage';

export default function Fans() {
  return (
    <>
        <Header />
        <FansPage />
        <Footer />
    </>
  );
}

Fans.layout = RootLayout;