import React from 'react';
import Header from "../components/header/header";
import Footer from "../components/footer/footer"
import ProfilePage from '../components/profilePage';
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