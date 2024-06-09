import React from 'react';
import Header from "./components/header/header";
import Footer from "./components/footer/footer"
import RootLayout from './layout';
import MainPage from './components/homePage/homePage';

export default function Home() {
  return (
      <main>
        <Header />
        <MainPage />
        <Footer />
      </main>
  );
}

Home.layout = RootLayout;