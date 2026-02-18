import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  InputGroup,
  Input,
  CloseButton,
  Popover,
  useListCollection,
  useFilter,
  Listbox,
  Group,
  IconButton,
} from '@chakra-ui/react';
import { CardData } from '@/types/pokemon-card';
import { LuSparkles } from 'react-icons/lu';
import { CardSearcher } from '@/utils/identification/cardSearch';

interface CardSearchProps {
  cards?: CardData[];
  setFilteredIds: (ids?: string[]) => void;
}

export const CardSearch = ({ cards, setFilteredIds }: CardSearchProps) => {
  const cardSearch = useRef<Awaited<ReturnType<typeof CardSearcher>>>(null);
  const [csReady, setCSReady] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [listboxValue, setListboxValue] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      cardSearch.current = await CardSearcher();
      setCSReady(true);
    };

    init();
  }, []);

  const searchForCard = useMemo(() => {
    if (!csReady || !cards || !cardSearch.current) {
      return () => [];
    }

    const ids = cards.map(({ id }) => id);
    return cardSearch.current.getFilteredSearch(ids);
  }, [csReady, cards]);

  const { contains } = useFilter({ sensitivity: 'base' });

  const initialItems = useMemo(() => {
    if (!cards) {
      return [];
    }

    const items: Record<string, string[]> = {};
    for (const card of cards) {
      if (!items[card.name]) {
        items[card.name] = [];
      }

      items[card.name].push(card.id);
    }

    return Object.entries(items)
      .map(([label, ids]) => ({
        label,
        value: { ids, name: label },
      }))
      .toSorted((a, b) => a.label.localeCompare(b.label));
  }, [cards]);

  const { collection, filter } = useListCollection({
    initialItems,
    filter: contains,
  });

  const handleSelectionChange = useCallback(
    (details_: unknown) => {
      const details = details_ as { value: { name: string; ids: string[] } };
      setSearchValue(details.value.name);
      setFilteredIds(details.value.ids);
      filter(details.value.name);
      setOpen(false);
    },
    [setFilteredIds, filter]
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    setListboxValue([]);
    filter('');
    setFilteredIds();
    setOpen(false);
  }, [filter, setFilteredIds]);

  const handleSearch = useCallback(async () => {
    searchRef.current?.blur();

    if (!searchValue) {
      handleClear();
      return;
    }

    const matches = await searchForCard(searchValue);
    setFilteredIds(matches.map(({ id }) => id));
  }, [searchForCard, searchValue, handleClear, setFilteredIds]);

  const clearSearch = searchValue ? (
    <CloseButton size="xs" onClick={handleClear} me={-2} />
  ) : undefined;

  return (
    <Popover.Root
      autoFocus={false}
      positioning={{ sameWidth: true }}
      open={open}
    >
      <Popover.Trigger asChild>
        <Group attached w="full">
          <InputGroup endElement={clearSearch}>
            <Input
              placeholder="Search by name or describe the pokemon..."
              ref={searchRef}
              value={searchValue}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setSearchValue(value);
                filter(value);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 100)}
              onKeyDown={(key) => {
                if (key.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </InputGroup>
          <IconButton aria-label="Search" onClick={() => handleSearch()}>
            <LuSparkles />
          </IconButton>
        </Group>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content width="auto">
          <Listbox.Root
            collection={collection}
            onSelect={handleSelectionChange}
            value={listboxValue}
          >
            {collection.items.length ? (
              <Listbox.Content>
                {collection.items.map((item) => (
                  <Listbox.Item item={item} key={item.label}>
                    <Listbox.ItemText>{item.label}</Listbox.ItemText>
                  </Listbox.Item>
                ))}
              </Listbox.Content>
            ) : null}
          </Listbox.Root>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};
