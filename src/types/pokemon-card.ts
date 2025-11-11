interface PokemonSetInfo {
  cardCount: { official: number; total: number };
  id: string;
  logo?: string;
  name: string;
  symbol?: string;
}

interface PokemonVariant {
  firstEdition: boolean;
  holo: boolean;
  normal: boolean;
  reverse: boolean;
  wPromo: boolean;
}

interface PokemonVariantDetailed {
  type: string;
  size: string;
}

interface PokemonAttack {
  cost: string[];
  name: string;
  effect?: string;
  damage?: number;
}

export interface PokemonCard {
  category: string;
  id: string;
  illustrator: string;
  image: string;
  localId: string;
  name: string;
  rarity: string;
  set: PokemonSetInfo;
  variants: PokemonVariant;
  variants_detailed: PokemonVariantDetailed[];
  dexId: number[];
  hp: number;
  types: string[];
  stage: string;
  attacks: PokemonAttack[];
  retreat: number;
  regulationMark: string;
  legal: { standard: boolean; expanded: boolean };
  updated: string;
  pricing: {
    cardmarket: {
      updated: string;
      unit: string;
      avg: number;
      low: number;
      trend: number;
      avg1: number;
      avg7: number;
      avg30: number;
      'avg-holo': number;
      'low-holo': number;
      'trend-holo': number;
      'avg1-holo': number;
      'avg7-holo': number;
      'avg30-holo': number;
    };
    tcgplayer: null;
  };
}
