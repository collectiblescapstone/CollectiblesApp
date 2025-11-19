export interface FormValues {
  name: string;
  bio: string;
  location: string;
  instagram: string;
  twitter: string;
  facebook: string;
  visibility: string;
}

export interface PokemonCardImage {
  image: string;
  name: string;
}

export interface PokemonCard {
  cards: PokemonCardImage[];
}
