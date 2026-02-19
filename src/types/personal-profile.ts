export interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  location: string;
  longitude: number;
  latitude: number;
  instagram: string;
  x: string;
  facebook: string;
  whatsapp: string;
  discord: string;
  profilePic: number;
  visibility: VisibilityValues;
}

export enum VisibilityValues {
  Public = 'public',
  Private = 'private',
  FriendsOnly = 'friends_only',
}

export interface UserProfile {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  bio?: string | null;
  location?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  instagram?: string;
  x?: string;
  facebook?: string;
  discord?: string;
  whatsapp?: string;
  profile_pic: number;
  visibility: VisibilityValues;
  wishlist: {
    card: {
      name: string;
      image_url: string;
    };
  }[];
  tradeList: {
    card: {
      name: string;
      image_url: string;
    };
  }[];
  showcaseList: {
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
