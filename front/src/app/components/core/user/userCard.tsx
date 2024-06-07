'use client'

import React from 'react';
import classNames from 'classnames';
import { User } from '@/app/types';
import "./userCard.scss";

interface UserCardProps {
    user: User,
    className?: string,
    liked: () => void;
    disliked: () => void;
    redirect: () => void;
}

const CLASSNAME = 'card';

const UserCard: React.FC<UserCardProps> = ({ user, liked, disliked, redirect }) => {

    return (
        <div className={CLASSNAME}>
            <img  onClick={redirect} src={user?.photos[0]} alt={`${user.username}'s profile`}
                className={`${CLASSNAME}__photo`} />
            <div className={`${CLASSNAME}__informations`}>
                <div className={`${CLASSNAME}__redirect`} onClick={redirect}>
                    <p className={`${CLASSNAME}__informations-username`}>{user.username}, {user.age}</p>
                    <div className={`${CLASSNAME}__informations-location`}>
                        <img className={`${CLASSNAME}__informations-location-icon`} src='/alternate-map-marker.svg' alt='' />
                        <p className={`${CLASSNAME}__informations-location-text`}>{user.location}</p>
                    </div>
                    <p className={`${CLASSNAME}__informations-bio`}>{user.biography}</p>
                </div>
                <div className={`${CLASSNAME}__interests`}>
                    {user.interests.map((interest, index) => (
                        <span key={index} className={`${CLASSNAME}__tag`}>{interest}</span>
                    ))}
                </div>
                    <div className={`${CLASSNAME}__swipe`}>
                        <div onClick={liked}>
                            <img className={`${CLASSNAME}__swipe-heart`} src='/like-dark-border.png' alt='' />
                        </div>
                        <div onClick={disliked}>
                            <img className={`${CLASSNAME}__swipe-cross`} src='/cross.png' alt='' />
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default UserCard;