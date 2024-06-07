'use client'
import React from 'react';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import RootLayout from '../../layout';
import ProfileView from '@/app/components/viewProfile';

export default function ProfileViewComponent() {

    return (
        <>
            <Header />
            <ProfileView />
            <Footer />
        </>
    );
};

ProfileViewComponent.layout = RootLayout;
