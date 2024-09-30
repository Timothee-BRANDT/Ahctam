export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  age: number;
  email?: string;
  location: number[];
  address: string;
  town: string;
  fame_rating: number;
  is_active: boolean;
  status: string;
  last_connexion: Date | string;
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

export interface FirstLoginInformations {
  token: string;
  age: number;
  gender: string;
  sexualPreference: string;
  biography: string;
  interests: string[];
  photos: string[];
  location: number[];
}

export interface AddressProperties {
  id: string;
  label: string;
}

export interface AddressSuggestion {
  properties: AddressProperties;
}

export interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}
