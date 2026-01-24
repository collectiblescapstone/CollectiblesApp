'use client';

import React, { useEffect } from 'react';
import { useState } from 'react';

import {
  Button,
  Popover,
  HStack,
  Text,
  Checkbox,
  Separator,
  Stack,
} from '@chakra-ui/react';

const CardFilter: React.FC = () => {
  const GENERATION: number[] = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm">
          Filters
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content>
          <Popover.Header textAlign="center" fontWeight="bold">
            Filters
          </Popover.Header>
          <Popover.Body>
            <Stack>
              <Text textAlign="center" fontWeight="bold">
                Generation
              </Text>
              <HStack justify="center" gap={4} flexWrap="wrap">
                {GENERATION.map((gen, key) => (
                  <Checkbox.Root key={key}>
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
                {GENERATION.map((gen, key) => (
                  <Checkbox.Root key={key}>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>{gen}</Checkbox.Label>
                  </Checkbox.Root>
                ))}
              </HStack>
            </Stack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
};

export default CardFilter;
