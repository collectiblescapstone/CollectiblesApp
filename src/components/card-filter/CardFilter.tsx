'use client';

import React, { useState, useEffect } from 'react';
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
import { useFilters, defaultFilters, Filters } from '@/hooks/useFilters';

const CardFilter: React.FC = () => {
  const { filters, setFilters } = useFilters();

  // Popover control
  const [open, setOpen] = useState(false);

  // Draft state (local changes before confirm)
  const [draft, setDraft] = useState<Filters>(filters);

  // Sync draft from global filters when popover opens
  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [open, filters]);

  // Toggle generation (array)
  const toggleGeneration = (gen: number, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      generations: checked
        ? [...prev.generations, gen]
        : prev.generations.filter((g) => g !== gen),
    }));
  };

  // Toggle type (boolean map)
  const toggleType = (type: string, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: checked,
      },
    }));
  };

  // Toggle category (array)
  const toggleCategory = (category: string, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  // Reset draft to default
  const resetDraft = () => {
    setDraft(defaultFilters);
  };

  return (
    <Popover.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
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
            <Stack gap={4}>
              {/* Generation */}
              <Text textAlign="center" fontWeight="bold">
                Generation
              </Text>
              <HStack justify="center" gap={4} flexWrap="wrap">
                {defaultFilters.generations.map((gen) => (
                  <Checkbox.Root
                    key={gen}
                    checked={draft.generations.includes(gen)}
                    onCheckedChange={(d) =>
                      toggleGeneration(gen, d.checked === true)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{gen}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </HStack>

              <Separator />

              {/* Types */}
              <Text textAlign="center" fontWeight="bold">
                Types
              </Text>
              <HStack justify="center" gap={4} flexWrap="wrap">
                {Object.keys(defaultFilters.types).map((type) => (
                  <Checkbox.Root
                    key={type}
                    checked={draft.types[type]}
                    onCheckedChange={(d) =>
                      toggleType(type, d.checked === true)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgPuller('PokemonTypes', type.toLowerCase())}
                        alt={type}
                        width={24}
                        height={24}
                      />
                    </Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </HStack>

              <Separator />

              {/* Categories */}
              <Text textAlign="center" fontWeight="bold">
                Category
              </Text>
              <SimpleGrid columns={2} gap={4}>
                {defaultFilters.categories.map((category) => (
                  <Checkbox.Root
                    key={category}
                    checked={draft.categories.includes(category)}
                    onCheckedChange={(d) =>
                      toggleCategory(category, d.checked === true)
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{category}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </SimpleGrid>

              <Separator />

              {/* Reset draft */}
              <Button variant="outline" size="sm" onClick={resetDraft}>
                Reset
              </Button>

              {/* Actions */}
              <HStack width="100%" gap={1}>
                <Button
                  flex={1}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(filters); // revert changes
                    setOpen(false); // close popover
                  }}
                >
                  Cancel
                </Button>

                <Button
                  flex={1}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters(draft); // save changes globally
                    setOpen(false); // close popover
                  }}
                >
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
