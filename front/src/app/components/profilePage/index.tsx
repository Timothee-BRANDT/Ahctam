'use client'

import React, { useContext, useEffect } from 'react';
// import "./profile.scss"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/authContext';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { logout, user } = useAuth();
  return (
    <>
        {user.firstname &&
            <>
                <p>Welcome {user?.firstname}</p>
                <img className="profile-picture" src="https://cdn4.volusion.store/kapts-nrbqf/v/vspfiles/photos/GUINEAPIGONEDRESSED-2.jpg?v-cache=1590745950"></img>
            </>
        }
    </>
  );
}

export default ProfilePage;