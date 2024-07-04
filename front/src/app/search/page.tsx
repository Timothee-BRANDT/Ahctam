import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import RootLayout from '../layout';
import SearchPage from '../components/searchPage/searchPage';

export default function Search() {
  return (
    <>
        <Header />
        <SearchPage />
        <Footer />
    </>
  );
}

Search.layout = RootLayout;