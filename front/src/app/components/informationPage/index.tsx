'use client'
import React, { useEffect, useState } from 'react';
import './index.scss';
import Button from '../core/button/button';
import { serverIP } from '@/app/constants';
import { useAuth } from '@/app/authContext';
import { ProfileInformations } from '@/app/types';
import { useRouter } from 'next/navigation';

const CLASSNAME = 'profile';

const InformationPage: React.FC = () => {
    const { user } = useAuth();
     const router = useRouter();
    const [profile, setProfile] = useState<ProfileInformations>({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: '',
        sexualPreference: '',
        biography: '',
        interests: [],
        photos: Array(6).fill(null)
    });

    const [updateFirstname, setUpdateFirstName] = useState(false);
    const [saveFirstname, setSaveFirstname] = useState('');

    const [allInterests, setAllInterests] = useState<Record<string, boolean>>({
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
    }, [allInterests])

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
        const payload = {
            firstname: profile.firstname,
            lastname: profile.lastname,
            email: profile.email,
            gender: profile.gender,
            sexualPreference: profile.sexualPreference,
            biography: profile.biography,
            interests: profile.interests,
            photos: profile.photos,
        }
        if (!payload.sexualPreference) {
            payload.sexualPreference = 'both';
        }
        if (!payload.gender) {
            payload.gender = 'other';
        }
        console.log('Payload -> ', payload);
        const response = await fetch(`http://${serverIP}:3333/auth/first-log`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payload,
                id: user.id,
            })
        })
        if (response.ok) {
            router.push('/');
        }
    };

    const getInterestsIndices = (record: Record<string, boolean>) => {
        return Object.entries(record)
            .reduce((acc: number[], [key, value], index) => {
                if (value) {
                    acc.push(index);
                }
                return acc as number[];
            }, []);
    };

    const selectInterest = (interest: string) => {
        const newInterests = { ...allInterests };
        newInterests[interest] = !newInterests[interest];
        setAllInterests(newInterests);
        const trueIndices = getInterestsIndices(newInterests);
        setProfile({
            ...profile,
            interests: trueIndices,
        });
    };

    const handleFirstname = () => {
        setUpdateFirstName(true);
        setSaveFirstname(profile.firstname);
    }

    const cancelFirstnameUpdate = () => {
        setUpdateFirstName(false)
        setProfile({
            ...profile,
            firstname: saveFirstname,
        })
    }

    const confirmFirstnameUpdate = () => {
        setUpdateFirstName(false)
    }

    return (
        <>
            <div className={CLASSNAME}>
                <form onSubmit={handleSubmit}>
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Firstname</p>
                        <div className={`${CLASSNAME}__update-button`} onClick={handleFirstname}>Update</div>
                        <div className={`${CLASSNAME}__update-button`} onClick={confirmFirstnameUpdate}>Confirm</div>
                        <div className={`${CLASSNAME}__update-button`} onClick={cancelFirstnameUpdate}>Cancel</div>
                    </div>
                        {!updateFirstname ? (
                            <p className={`${CLASSNAME}__info`}>{profile.firstname}</p>
                        ) : (
                            <>
                                <input
                                    className={`${CLASSNAME}__update-input`}
                                    type="firstname"
                                    name="firstname"
                                    value={profile.firstname}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </>
                        )}
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Lastname</p>
                    </div>
                        <p className={`${CLASSNAME}__info`}>{user.lastname}</p>
                    <div className={`${CLASSNAME}__info-container`}>
                        <p className={`${CLASSNAME}__title`}>Email</p>
                    </div> 
                        <p className={`${CLASSNAME}__info`}>{user.email}</p>
                    <p className={`${CLASSNAME}__title`}>I am</p>
                    <div className={`${CLASSNAME}__radio-button`}>
                        <div>
                            <input type="radio"
                                id="gender-female" name="gender" value="female"
                                checked={profile.gender === 'female'}
                                onChange={handleChange}  />
                            <label htmlFor="gender-female">Female</label>
                        </div>
                        <div>
                            <input type="radio"
                                id="gender-male" name="gender" value="male"
                                checked={profile.gender === 'male'}
                                onChange={handleChange}  />
                            <label htmlFor="gender-male">Male</label>
                        </div>
                        <div>
                            <input type="radio"
                                id="gender-other" name="gender" value="other"
                                checked={profile.gender === 'other'}
                                onChange={handleChange}  />
                            <label htmlFor="gender-other">Other</label>
                        </div>
                    </div>

                    <p className={`${CLASSNAME}__title`}>I'm looking for</p>
                    <div className={`${CLASSNAME}__radio-button`}>
                        <div>
                            <input type="radio"
                                id="sexual-female" name="sexualPreference" value="female"
                                checked={profile.sexualPreference === 'female'}
                                onChange={handleChange}  />
                            <label htmlFor="sexual-female">Female</label>
                        </div>
                        <div>
                            <input type="radio"
                                id="sexual-male" name="sexualPreference" value="male"
                                checked={profile.sexualPreference === 'male'}
                                onChange={handleChange}  />
                            <label htmlFor="sexual-male">Male</label>
                        </div>
                        <div>
                            <input type="radio"
                                id="sexual-both" name="sexualPreference" value="both"
                                checked={profile.sexualPreference === 'both'}
                                onChange={handleChange}  />
                            <label htmlFor="sexual-both">Both</label>
                        </div>
                    </div>

                    <p className={`${CLASSNAME}__title`}>About me</p>
                    <textarea
                        name="biography"
                        spellCheck="false" 
                        value={profile.biography}
                        onChange={handleChange}
                    />
                    <p className={`${CLASSNAME}__title`}>My interests</p>
                    <div className={`${CLASSNAME}__interests-container`}>
                        {Object.entries(allInterests).map(([interest, isSelected]) => (
                            <div className={!isSelected ? `${CLASSNAME}__interests` : `${CLASSNAME}__interests__selected`}
                                onClick={() => { selectInterest(interest) }}
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
                    <Button className="button-info" title="Save" type="submit" onClick={() => { }} />
                </form>
            </div>
        </>
    );
}

export default InformationPage;