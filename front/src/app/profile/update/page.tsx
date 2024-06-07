'use client'
import React from 'react';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import RootLayout from '../../layout';
import ProfilePage from '../../components/editProfile';

export default function ProfileUpdate() {

    return (
        <>
            <Header />
            <ProfilePage />
            <Footer />
        </>
    );
};

ProfileUpdate.layout = RootLayout;
