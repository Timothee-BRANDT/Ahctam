'use client'
import React, { useState } from 'react';
import './index.scss';
import Button from '../core/button/button';
import { serverIP } from '@/app/constants';

const CLASSNAME = 'profile';

const InformationPage: React.FC = () => {
  const [profile, setProfile] = useState({
    gender: '',
    sexualPreference: '',
    biography: '',
    interests: '',
    photos: Array(5).fill(null)
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    console.log(name)
    console.log(name)
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
    console.log(JSON.stringify({
        ...profile,
    }))
    e.preventDefault();
    // send the data to the backend
    // redirect the user to /
    const response = await fetch(`http://${serverIP}:3333/auth/first-log`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          ...profile,
      })
    })
  };

  return (
    <>
      <div className={CLASSNAME}>
        <form onSubmit={handleSubmit}>
            <p className={`${CLASSNAME}__title`}>I am</p>
            <div className={`${CLASSNAME}__sexual-preference`}>
                <div>
                    <input className={`${CLASSNAME}__sexual-preference--input`} type="radio" 
                        id="gender-female" name="gender" value="female" 
                        checked={profile.gender === 'female'} 
                        onChange={handleChange} required />
                    <label htmlFor="gender-female">Female</label>
                </div>
                <div>
                    <input className={`${CLASSNAME}__sexual-preference--input`} type="radio" 
                        id="gender-male" name="gender" value="male"
                        checked={profile.gender === 'male'}
                        onChange={handleChange} required />
                    <label htmlFor="gender-male">Male</label>
                </div>
                <div>
                    <input className={`${CLASSNAME}__sexual-preference--input`} type="radio"
                        id="gender-non-binary" name="gender" value="non-binary"
                        checked={profile.gender === 'non-binary'}
                        onChange={handleChange} required />
                    <label htmlFor="gender-non-binary">Non-binary</label>
                </div>
            </div>

            <p className={`${CLASSNAME}__title`}>I'm looking for</p>
            <div className={`${CLASSNAME}__sexual-preference`}>
                <div>
                    <input className={`${CLASSNAME}__sexual-preference--input`} type="radio" 
                        id="female" name="sexualPreference" value="female" 
                        checked={profile.sexualPreference === 'female'} 
                        onChange={handleChange} required />
                    <label htmlFor="sexual-female">Female</label>
                </div>
                <div>
                    <input className={`${CLASSNAME}__sexual-preference--input`} type="radio" 
                        id="male" name="sexualPreference" value="male"
                        checked={profile.sexualPreference === 'male'}
                        onChange={handleChange} required />
                    <label htmlFor="sexual-male">Male</label>
                </div>
                <div>
                    <input className={`${CLASSNAME}__sexual-preference--input`} type="radio"
                        id="both" name="sexualPreference" value="both"
                        checked={profile.sexualPreference === 'both'}
                        onChange={handleChange} required />
                    <label htmlFor="sexual-both">Both</label>
                </div>
            </div>

            <p className={`${CLASSNAME}__title`}>About me</p>
            <textarea
                name="biography"
                value={profile.biography}
                onChange={handleChange}
            />

            <p className={`${CLASSNAME}__title`}>Interests</p>
            <input
                type="text"
                name="interests"
                value={profile.interests}
                onChange={handleChange}
                placeholder="#hay #vegetables #pellets"
            />

            <div className="photo-upload-container">
                {profile.photos.map((photo, index) => (
                <div onClick={() => document.getElementsByName(`photoUpload${index}`)[0].click()}
                    key={index} className="photo-placeholder" 
                    style={{ backgroundImage: photo ? `url(${photo})` : 'none' }}>
                    <input
                    type="file"
                    name={`photoUpload${index}`}
                    accept="image/*"
                    onChange={(e) => handleImageChange(index, e)}
                    style={{ display: 'none' }}
                    />
                    {!photo ? <div className="upload-text">Upload a picture</div>: ''}
                </div>
                ))}
            </div>
            <Button className="button-info" title="Save" type="submit" onClick={() => {}} />
        </form>
      </div>
    </>
  );
}
