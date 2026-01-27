import { createContext, useContext, useState, ReactNode } from 'react';

export type Filters = {
  generations: number[];
  types: string[];
  categories: string[];
};

const defaultFilters: Filters = {
  generations: Array.from({ length: 9 }, (_, i) => i + 1),
  types: [
    'Grass',
    'Fire',
    'Water',
    'Lightning',
    'Psychic',
    'Fighting',
    'Darkness',
    'Metal',
    'Fairy',
    'Dragon',
    'Colorless',
  ],
  categories: ['Pokémon', 'Item', 'Trainer', 'Energy'],
};

type FiltersContextType = {
  filters: Filters;
  setFilters: (filters: Filters) => void;
};

const FiltersContext = createContext<FiltersContextType>({
  filters: defaultFilters,
  setFilters: () => {},
});

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);
