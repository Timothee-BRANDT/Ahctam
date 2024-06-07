'use client'

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/authContext';
import UserCard from '../core/user/userCard';
import data from '../../api.json';

import './homePage.scss';
import { Input } from '@/components/ui/input';

const mainPage: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();

    const liked = () => {
        console.log('LIKED');
    }

    const dissliked = () => {
        console.log('DISSLIKED');
    }

    const redirect  = () => {
        router.push(`/profile/${user.id}`);
    }

    // [WARNING] Removed for dev mode confort, need to be uncommented
    // useEffect(() => {
    //     if (pathname !== '/login' && !user.jwt_token)
    //         redirectLogin();
    // })

    // const redirectLogin = () => {
    //     router.push('/login');
    // }

    return (
        <>
            <UserCard user={data.user} liked={liked} disliked={dissliked} redirect={redirect} />
        </>
    );
}

export default mainPage;