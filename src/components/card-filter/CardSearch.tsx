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

type PartialCardData = Partial<CardData> & Pick<CardData, 'id' | 'name'>;

interface CardSearchProps {
  cards?: PartialCardData[];
  setFilteredIds: (ids?: string[]) => void;
  filterOnly?: boolean;
}

export const CardSearch = ({
  cards,
  setFilteredIds,
  filterOnly,
}: CardSearchProps) => {
  const cardSearch = useRef<Awaited<ReturnType<typeof CardSearcher>>>(null);
  const [csReady, setCSReady] = useState(false);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [listboxValue, setListboxValue] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (filterOnly) {
      return;
    }

    const init = async () => {
      cardSearch.current = await CardSearcher();
      setCSReady(true);
    };

    init();
  }, [filterOnly]);

  const searchForCard = useMemo(() => {
    if (!csReady || !cards || !cardSearch.current) {
      return () => [];
    }

    const ids = cards.map(({ id }) => id);
    return cardSearch.current.getFilteredSearch(ids);
  }, [csReady, cards]);

  const { contains } = useFilter({ sensitivity: 'base' });

  const [nameToIds, setNamesToIds] = useState<Record<string, string[]>>({});
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

    const lowercasedItems: typeof items = {};
    for (const [name, ids] of Object.entries(items)) {
      lowercasedItems[name.toLowerCase()] = ids;
    }

    setNamesToIds(lowercasedItems);

    return Object.entries(items)
      .map(([label]) => ({
        label,
        value: label,
      }))
      .toSorted((a, b) => a.label.localeCompare(b.label));
  }, [cards]);

  const { collection, filter } = useListCollection({
    initialItems,
    filter: contains,
  });

  const handleSelectionChange = useCallback(
    (details_: unknown) => {
      const details = details_ as { value: string };
      const filteredName = details.value.toLowerCase();
      const similarNames = Object.keys(nameToIds).filter((name) =>
        name.includes(filteredName)
      );
      const ids = similarNames.flatMap((name) => nameToIds[name]);
      setSearchValue(details.value);
      filter(details.value);
      setFilteredIds(ids);
      setOpen(false);
    },
    [setFilteredIds, filter, nameToIds]
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

    if (filterOnly) {
      handleSelectionChange({ value: searchValue });
      return;
    }

    if (!searchValue) {
      handleClear();
      return;
    }

    const matches = await searchForCard(searchValue);
    setFilteredIds(matches.map(({ id }) => id));
  }, [searchForCard, searchValue, handleClear, setFilteredIds, filterOnly]);

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
              placeholder={`Search by name${filterOnly ? '' : ' or describe the card...'}`}
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
          {!filterOnly && (
            <IconButton aria-label="Search" onClick={() => handleSearch()}>
              <LuSparkles />
            </IconButton>
          )}
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
