'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type Filters = {
  generations: number[];
  types: Record<string, boolean>;
  categories: string[];
};

export const defaultFilters: Filters = {
  generations: Array.from({ length: 9 }, (_, i) => i + 1),
  types: {
    Grass: true,
    Fire: true,
    Water: true,
    Lightning: true,
    Psychic: true,
    Fighting: true,
    Darkness: true,
    Metal: true,
    Fairy: true,
    Dragon: true,
    Colorless: true,
  },
  categories: ['Pokémon', 'Item', 'Trainer', 'Energy'],
};

type FiltersContextType = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
};
