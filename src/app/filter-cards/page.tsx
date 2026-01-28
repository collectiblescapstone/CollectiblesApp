'use client';

import FilterCardsContent from './filterCardsContent';

// Hooks
import { FiltersProvider } from '@/hooks/useFilters';

export default function FilterCardsPage() {
  return (
    <FiltersProvider>
      <FilterCardsContent />
    </FiltersProvider>
  );
}
