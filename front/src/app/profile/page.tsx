'use client'
import React from 'react';
import Header from '../components/header/header';
import Footer from '../components/footer/footer';
import RootLayout from '../layout';
import ProfilePage from '../components/profilePage';

export default function ProfileComponent() {

  return (
    <>
      <Header />
      <ProfilePage />
      <Footer />
    </>
  );
};

ProfileComponent.layout = RootLayout;
