import React from 'react';
import Header from "./header/header";
import Footer from "./footer/footer"
import Authentification from "./authentification/login/login";
import { AuthProvider } from './authContext';

export default function Home() {
  return (
    <AuthProvider>
      <main>
        <Header />
        <Authentification />
        <Footer />
      </main>
    </AuthProvider>
  );
}