export interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  instagram: string;
  x: string;
  facebook: string;
  whatsapp: string;
  discord: string;
  profilePic: number;
  visibility: string;
}

export interface PokemonCardImage {
  image: string;
  name: string;
}

export interface PokemonCard {
  cards: PokemonCardImage[];
}
