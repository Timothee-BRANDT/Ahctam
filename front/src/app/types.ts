export interface User {
    id: number;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password_hash: string;
    is_active: boolean;
    registration_token: string;
    jwt_token: string;
    gender: string;
    sexual_preferences: string;
    biography: string;
    interests: string;
    created_at: string;
    firstTimeLogged: boolean;
}

export enum State {
    initial = "initial",
    loading = "loading",
    done = "done"
}
