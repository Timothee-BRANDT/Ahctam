export interface User {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    age: number;
    email?: string;
    password?: string;
    confirmPassword?: string;
    location: number[];
    address: string;
    town: string;
    fame_rating: number;
    is_active: boolean;
    is_connected?: boolean;
    last_connexion: Date | string;
    jwt_token: string;
    refresh_token: string;
    gender: string;
    sexual_preferences: string;
    biography: string;
    interests: string[];
    photos: string[];
    created_at: Date | string;
    firstTimeLogged: boolean;
}

export enum State {
    initial = "initial",
    loading = "loading",
    done = "done",
    redirect = "redirect",
}

export enum PaginationType {
    previous = "previous",
    next = "next",
}

export interface ProfileInformations {
    age: number;
    firstname: string;
    lastname: string;
    email: string;
    gender: string;
    sexualPreference: string;
    biography: string;
    interests: string[];
    photos: string[];
}
