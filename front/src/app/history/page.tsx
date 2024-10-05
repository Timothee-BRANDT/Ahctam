import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import RootLayout from '../layout';
import HistoryPage from '../components/history/historyPage';

export default function History() {
  return (
    <>
        <Header />
        <HistoryPage />
        <Footer />
    </>
  );
}

History.layout = RootLayout;