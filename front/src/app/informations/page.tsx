"use client";
import React, { useEffect, useState } from "react";
import "./index.scss";
import Button from "../components/button";
import Header from "../header/header";
import Footer from "../footer/footer";
import RootLayout from "../layout";

export default function UserInformations() {
  const serverIP = process.env.CKOILENOM || "127.0.0.1";
  const [profile, setProfile] = useState({
    gender: "",
    sexualPreference: "",
    biography: "",
    interests: "",
    photos: Array(5).fill(null),
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleImageChange = (index: any, e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const newPhotos = [...profile.photos];
      newPhotos[index] = reader.result as string;
      setProfile({
        ...profile,
        photos: newPhotos,
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    // send the data to the backend
    // redirect the user to /
    // WARNING: TIM I CHANGED THE URL HERE, I ALSO NEED THE ID OF THE USER
    const response = await fetch(`http://${serverIP}:5000/auth/first-login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile,
      }),
    });
    console.log(profile);
  };

  useEffect(() => {
    console.log(profile);
  });

  return (
    <>
      <Header />
      <div className="profile-container">
        <form onSubmit={handleSubmit}>
          <label htmlFor="gender">Gender</label>
          <select
            name="gender"
            value={profile.gender}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Gender
            </option>
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
            {profile.photos.map((photo, index) => (
              <div
                onClick={() =>
                  document.getElementsByName(`photoUpload${index}`)[0].click()
                }
                key={index}
                className="photo-placeholder"
                style={{ backgroundImage: photo ? `url(${photo})` : "none" }}
              >
                <input
                  type="file"
                  name={`photoUpload${index}`}
                  accept="image/*"
                  onChange={(e) => handleImageChange(index, e)}
                  style={{ display: "none" }}
                />
                {!photo ? (
                  <div className="upload-text">Upload a picture</div>
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>

          <Button
            className="button-info"
            title="Save"
            type="submit"
            onClick={() => { }}
          />
        </form>
      </div>
      <Footer />
    </>
  );
}

UserInformations.layout = RootLayout;
