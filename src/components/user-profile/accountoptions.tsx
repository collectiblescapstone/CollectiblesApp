'use client';

import React from 'react';

import {
  Button,
  Menu,
  Portal,
} from '@chakra-ui/react';
import { FiMoreVertical, FiSlash, FiUserX } from 'react-icons/fi';


const AccountOptions: React.FC = () => {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button 
          position="absolute" 
          top={28}
          left={2}
          rounded="sm"
          variant="ghost"
          h={'40px'}
          w={"20px"}
        >
            <FiMoreVertical size={24}/>
        </Button>
      </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="block-user">
                Block <Menu.ItemCommand><FiSlash size={20}/></Menu.ItemCommand>
              </Menu.Item>
              <Menu.Item color="red" value="report-user">
                Report <Menu.ItemCommand><FiUserX size={20}/></Menu.ItemCommand>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
    </Menu.Root>
  );
};

export default AccountOptions;