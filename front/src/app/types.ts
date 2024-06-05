export interface User {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword?: string;
    is_active: boolean;
    registration_token: string;
    jwt_token: string;
    gender: string;
    sexual_preferences: string;
    biography: string;
    interests: number[];
    photos: string[];
    created_at: string;
    firstTimeLogged: boolean;
}

export enum State {
    initial = "initial",
    loading = "loading",
    done = "done",
    redirect = "redirect",
}