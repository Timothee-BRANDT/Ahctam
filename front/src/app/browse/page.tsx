import React from "react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import RootLayout from "../layout";
import BrowsePage from "../components/browsePage/browsePage";

export default function Browse() {
  return (
    <>
      <Header />
      <BrowsePage />
      <Footer />
    </>
  );
}

Browse.layout = RootLayout;
