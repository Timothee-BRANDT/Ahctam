'use client'
import React, { useEffect, useState } from 'react';
import './index.scss';
import Button from '../core/button/button';
import { serverIP } from '@/app/constants';
import { useAuth } from '@/app/authContext';

const CLASSNAME = 'profile';

const InformationPage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        gender: '',
        sexualPreference: '',
        biography: '',
        interests: '',
        photos: Array(6).fill(null)
  });

  const [interests, setInterests] = useState<Record<string, boolean>>({
    'Exploring tunnels and mazes': false,
    'Running through obstacle courses': false,
    'Group naps': false,
    'Sharing fresh vegetable meals': false,
    'Chewing on wooden toys': false,
    'Rolling in exercise balls': false,
    'Sand and dust baths': false,
    'Hide and seek in tunnels': false,
    'Collecting hay and leaves': false,
    'Making cozy nests': false,
    'Pelage beauty contests': false,
    'Mutual grooming sessions': false,
    'Nibbling on carrots together': false,
    'Sharing cuddles and pets': false,
    'Outdoor exploration': false,
    'Enjoying group company': false,
    'Listening to relaxing music': false,
    'Participating in friendly races': false,
    'Discovering new vegetable flavors': false,
    'Experimenting with new hiding spots': false,
    'Carrots are the best': false,
  });

  useEffect(() => {

  }, [interests])

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
          id: user.id,
      })
    })
  };

  const selectInterest = (interest: string) => {
    const newInterests = {...interests};
    newInterests[interest] = !newInterests[interest];
    setInterests(newInterests);
  }

  return (
    <>
      <div className={CLASSNAME}>
      <p className={`${CLASSNAME}__main-title`}>Welcome to PiggyDate ! Tell us more about yourself !</p>
        <form onSubmit={handleSubmit}>
            <p className={`${CLASSNAME}__title`}>I am</p>
            <div className={`${CLASSNAME}__radio-button`}>
                <div>
                    <input type="radio" 
                        id="gender-female" name="gender" value="female" 
                        checked={profile.gender === 'female'} 
                        onChange={handleChange} required />
                    <label htmlFor="gender-female">Female</label>
                </div>
                <div>
                    <input type="radio" 
                        id="gender-male" name="gender" value="male"
                        checked={profile.gender === 'male'}
                        onChange={handleChange} required />
                    <label htmlFor="gender-male">Male</label>
                </div>
                <div>
                    <input type="radio"
                        id="gender-non-binary" name="gender" value="non-binary"
                        checked={profile.gender === 'non-binary'}
                        onChange={handleChange} required />
                    <label htmlFor="gender-non-binary">Non-binary</label>
                </div>
            </div>

            <p className={`${CLASSNAME}__title`}>I'm looking for</p>
            <div className={`${CLASSNAME}__radio-button`}>
                <div>
                    <input type="radio" 
                        id="sexual-female" name="sexualPreference" value="female" 
                        checked={profile.sexualPreference === 'female'} 
                        onChange={handleChange} required />
                    <label htmlFor="sexual-female">Female</label>
                </div>
                <div>
                    <input type="radio" 
                        id="sexual-male" name="sexualPreference" value="male"
                        checked={profile.sexualPreference === 'male'}
                        onChange={handleChange} required />
                    <label htmlFor="sexual-male">Male</label>
                </div>
                <div>
                    <input type="radio"
                        id="sexual-both" name="sexualPreference" value="both"
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
            <p className={`${CLASSNAME}__title`}>My interests</p>
            <div className={`${CLASSNAME}__interests-container`}>
                {Object.entries(interests).map(([interest, isSelected]) => (
                    <div className={!isSelected ? `${CLASSNAME}__interests` : `${CLASSNAME}__interests__selected`}
                        onClick={() => {selectInterest(interest)}}
                        key={interest}>
                        {interest}
                    </div>
                ))}
            </div>
            <p className={`${CLASSNAME}__title`}>Pictures</p>
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
                    {!photo && (
                        <div className={`upload-text ${index === 0 ? `${CLASSNAME}__profile-picture-uploader` : ''}`}>
                            {index === 0 ? 'Upload a profile picture' : 'Upload a picture'}
                        </div>
                    )} 
                </div>
                ))}
            </div>
            <Button className="button-info" title="Save" type="submit" onClick={() => {}} />
        </form>
      </div>
    </>
  );
}

export default InformationPage;