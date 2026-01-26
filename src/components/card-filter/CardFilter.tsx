'use client';

import React, { useEffect, useState } from 'react';
// import Image from 'next/image';

import {
  Button,
  Popover,
  HStack,
  Text,
  Checkbox,
  Separator,
  Stack,
  SimpleGrid,
} from '@chakra-ui/react';

import imgPuller from '@/utils/imgPuller';

// import { useFilters } from '@/hooks/useFilters';

const CardFilter: React.FC = () => {
  const GENERATION: number[] = Array.from({ length: 9 }, (_, i) => i + 1);

  const TYPE: string[] = [
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
  ];

  const CATEGORY: string[] = ['Pokémon', 'Item', 'Trainer', 'Energy'];

  const [checkedGenerations, setCheckedGenerations] =
    useState<number[]>(GENERATION);
  const [checkedTypes, setCheckedTypes] = useState<string[]>(TYPE);

  const [checkedCategories, setCheckedCategories] =
    useState<string[]>(CATEGORY);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          Filters
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Header textAlign="center" fontWeight="bold" fontSize="lg">
            Filters
          </Popover.Header>
          <Popover.Body>
            <Stack>
              <Text textAlign="center" fontWeight="bold">
                Generation
              </Text>
              <HStack justify="center" gap={4} flexWrap="wrap">
                {GENERATION.map((gen) => (
                  <Checkbox.Root
                    key={gen}
                    checked={checkedGenerations.includes(gen)}
                    onCheckedChange={(details) =>
                      setCheckedGenerations((prev) =>
                        details.checked
                          ? [...prev, gen]
                          : prev.filter((g) => g !== gen)
                      )
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{gen}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </HStack>
              <Separator />
              <Text textAlign="center" fontWeight="bold">
                Types
              </Text>
              <HStack justify="center" gap={4} flexWrap="wrap">
                {TYPE.map((type) => (
                  <Checkbox.Root
                    key={type}
                    checked={checkedTypes.includes(type)}
                    onCheckedChange={(details) =>
                      setCheckedTypes((prev) =>
                        details.checked
                          ? [...prev, type]
                          : prev.filter((t) => t !== type)
                      )
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>
                      <HStack gap={2}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgPuller('PokemonTypes', type.toLowerCase())}
                          alt={type}
                          width={24}
                          height={24}
                        />
                      </HStack>
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </HStack>
              <Separator />
              <Text textAlign="center" fontWeight="bold">
                Category
              </Text>
              <SimpleGrid columns={2} gap={4} justifyItems="stretch">
                {CATEGORY.map((category) => (
                  <Checkbox.Root
                    key={category}
                    checked={checkedCategories.includes(category)}
                    onCheckedChange={(details) =>
                      setCheckedCategories((prev) =>
                        details.checked
                          ? [...prev, category]
                          : prev.filter((c) => c !== category)
                      )
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{category}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </SimpleGrid>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCheckedGenerations(GENERATION);
                  setCheckedTypes(TYPE);
                  setCheckedCategories(CATEGORY);
                }}
              >
                Reset
              </Button>
              <HStack justify="center" width="100%" gap={1}>
                <Button flex={1} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button flex={1} variant="outline" size="sm">
                  Confirm
                </Button>
              </HStack>
            </Stack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};

export default CardFilter;
