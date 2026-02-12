'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Flex, Image, Input } from '@chakra-ui/react';
import { CardSearcher } from '@/utils/identification/cardSearch';
import Divider from '@/components/profiles/Divider';

export const SearchForCard: React.FC = () => {
  const cardSearch = useRef<Awaited<ReturnType<typeof CardSearcher>>>(null);
  const [csReady, setCSReady] = useState(false);
  const [matches, setMatches] = useState<
    {
      id: string;
      score: number;
    }[]
  >();

  useEffect(() => {
    const init = async () => {
      cardSearch.current = await CardSearcher();
      setCSReady(true);
    };

    init();
  }, []);

  const handleSearch = useCallback(
    (evt: KeyboardEvent<HTMLInputElement>) => {
      if (!csReady || !cardSearch.current) {
        return;
      }

      if (evt.key === 'Enter') {
        cardSearch.current(evt.currentTarget.value).then((data) => {
          setMatches(data);
        });
      }
    },
    [csReady]
  );

  return (
    <Flex
      flexDirection="column"
      gap={2}
      justifyContent="flex-start"
      alignItems="flex-start"
      w="100%"
      px={4}
    >
      <Divider />
      <Input onKeyDown={handleSearch}></Input>
      <Flex
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        wrap="wrap"
        gap={5}
      >
        {matches?.map((match, index) => {
          // TODO: fetch image url with id
          const idParts = match.id
            .split(/(?<=[a-z])(\d.*)-/)
            .map((a) => a.split('-'))
            .flat();
          let url = '';
          if (idParts.length === 3) {
            url = `${idParts[0]}/${idParts[0]}${idParts[1]}/${idParts[2]}`;
          } else {
            url = `${idParts[0].substring(0, Math.max(idParts[0].length - 1, 2))}/${idParts[0]}/${idParts[1]}`;
          }

          return (
            <Flex key={index} flexDirection={'column'} alignItems={'center'}>
              <div>Score: {Math.round(match.score * 1000) / 1000}</div>
              <Image
                src={`https://assets.tcgdex.net/en/${url}/low.png`}
                alt={match.id}
                w="105px"
                h="auto"
                borderRadius="none"
              />
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
