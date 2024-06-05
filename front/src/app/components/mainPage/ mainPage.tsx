'use client'
import { useEffect } from 'react';
import './mainPage.scss';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/authContext';

const mainPage: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    useEffect(() => {
        if (pathname !== '/login' && !user.jwt_token)
        redirectLogin();
    })

    const redirectLogin = () => {
        router.push('/login');
    }

  return (
        <div>HELLO</div>
  );
}

export default mainPage;