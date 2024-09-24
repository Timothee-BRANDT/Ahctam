"use client";
import React, { useEffect, useState } from "react";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import RootLayout from "../../layout";
import ProfileView from "@/app/components/viewProfile";
import { useParams, useRouter } from "next/navigation";

export default function ProfileViewComponent() {
  const params = useParams();
  const { id } = params;

  return (
    <>
      <Header />
      {id && <ProfileView idProps={id} />}
      <Footer />
    </>
  );
}

ProfileViewComponent.layout = RootLayout;
