'use client';

import React from 'react';
import {
  Flex,
  Button,
  ButtonGroup,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import { GoRows } from 'react-icons/go';
import { FiGrid } from 'react-icons/fi';

export default function PokemonGridPage() {
  // True is row, false is grid
  const [display, setDisplay] = React.useState(true);

  function displayClick() {
    setDisplay(!display);
    console.log(display);
  }

  const frameworks = createListCollection({
    items: [
      { label: 'Set', value: 'set' },
      { label: 'Pokémon', value: 'pokemon' },
    ],
  });

  return (
    <div>
      {/* <Button onClick={displayClick}>
        <Icon size="lg" color="white">
          {display ? <GoRows /> : <FiGrid />}
        </Icon>
      </Button> */}
      <Select.Root
        collection={frameworks}
        size="sm"
        width="300px "
        defaultValue={['set']}
      >
        <Select.HiddenSelect />
        <Select.Label>Sort By</Select.Label>
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder="Select sort" />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Portal>
          <Select.Positioner>
            <Select.Content>
              {frameworks.items.map((framework) => (
                <Select.Item item={framework} key={framework.value}>
                  {framework.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Portal>
      </Select.Root>
    </div>
  );
}
