'use client'
import React, { useState } from 'react';
import './index.scss';
import Button from '../components/button';
import Header from '../header/header';
import Footer from '../footer/footer';
import RootLayout from '../layout';

export default function UserInformations() {
  const [profile, setProfile] = useState({
    gender: '',
    sexualPreference: '',
    biography: '',
    interests: '',
    photos: [],
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // send the data to the backend
    // redirect the user to /
    console.log(profile);
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="gender">Gender</label>
          <select name="gender" value={profile.gender} onChange={handleChange} required>
            <option value="" disabled>Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
          </select>

          <label htmlFor="sexualPreference">Sexual Preference</label>
          <input
            type="text"
            name="sexualPreference"
            value={profile.sexualPreference}
            onChange={handleChange}
          />

          <label htmlFor="biography">Biography</label>
          <textarea
            name="biography"
            value={profile.biography}
            onChange={handleChange}
          />

          <label htmlFor="interests">Interests</label>
          <input
            type="text"
            name="interests"
            value={profile.interests}
            onChange={handleChange}
            placeholder="#hay #vegetables #pellets"
          />

          <div className="photo-upload-container">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="photo-placeholder">
              </div>
            ))}
          </div>

          <Button title="Save" type="submit" onClick={() => {}} />
        </form>
      </div>
      <Footer />
    </>
  );
};

UserInformations.layout = RootLayout;