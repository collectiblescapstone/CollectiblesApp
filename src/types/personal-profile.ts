export interface FormValues {
  name: string;
  bio: string;
  location: string;
  instagram: string;
  twitter: string;
  facebook: string;
  visibility: string;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string | null;
  location: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  wishlist: {
    card: {
      name: string;
      image_url: string;
    };
  }[];
  tradeCards: {
    card: {
      name: string;
      image_url: string;
    };
  }[];
}

export interface PokemonCardImage {
  image: string;
  name: string;
}

export interface PokemonCard {
  cards: PokemonCardImage[];
}
