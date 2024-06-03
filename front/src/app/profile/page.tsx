import React from 'react';
import Header from "../header/header";
import Footer from "../footer/footer"
import ProfilePage from '../components/profile';
import RootLayout from '../layout';

export default function Profile() {
    return (
        <>
            <Header />
            <ProfilePage />
            <Footer />
        </>
      );
}

Profile.layout = RootLayout;