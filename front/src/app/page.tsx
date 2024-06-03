import React from 'react';
import Header from "./header/header";
import Footer from "./footer/footer"
import Login from './components/authentification/login/login';
import RootLayout from './layout';

export default function Home() {
  return (
      <main>
        <Header />
        <Login />
        <Footer />
      </main>
  );
}

Home.layout = RootLayout;