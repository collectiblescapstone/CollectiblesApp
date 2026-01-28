interface PokemonJSON {
  id: number;
  name: string;
}

const pokedexData: string[] = [];
const fetchPokedex = async () => {
  try {
    const specifiedCards = await fetch('/temporary_card_data/pokedex.json');
    const pokedexDataJSON: PokemonJSON[] = await specifiedCards.json();
    for (const pokemon of pokedexDataJSON) {
      pokedexData.push(pokemon.name);
    }
  } catch (err) {
    console.error('Fetch error for pokedex:', err);
  }
};

export const getPokemonName = async (id: number): Promise<string> => {
  if (pokedexData.length === 0) {
    await fetchPokedex();
  }
  if (id < 1 || id > 1025) return 'N/A';
  return pokedexData[id - 1];
};

const POKEMONGEN = [151, 251, 386, 493, 649, 721, 809, 905, 1025];

export const getGeneration = (dexNumber: number) => {
  for (let i = 0; i < POKEMONGEN.length; i++) {
    if (dexNumber <= POKEMONGEN[i] && dexNumber > 0) return i + 1;
  }
  return 0;
};
