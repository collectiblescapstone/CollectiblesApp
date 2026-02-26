'use client';

import React from 'react';

import { Box, Button, Menu, Portal } from '@chakra-ui/react';
import { FiMoreVertical, FiSlash, FiUserX } from 'react-icons/fi';
import { LuStar } from 'react-icons/lu';
import RatingPopup from '@/components/ui/PopupUI';
import RatingForm from './RatingForm';
import { UserProfile } from '@/types/personal-profile';

interface AccountOptionsProps {
  user: UserProfile;
}

const AccountOptions = ({ user }: AccountOptionsProps) => {
  return (
    <Box>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button rounded="sm" variant="ghost" h={'40px'} w={'20px'}>
            <FiMoreVertical size={24} />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="block-user">
                Block{' '}
                <Menu.ItemCommand>
                  <FiSlash size={20} />
                </Menu.ItemCommand>
              </Menu.Item>
              <Menu.Item
                value="rate-user"
                onClick={() =>
                  RatingPopup.open('rate-user', {
                    title: 'Rate this User',
                    content: (
                      <RatingForm
                        closeOnSubmit={RatingPopup.close}
                        user={user}
                      />
                    ),
                    onClickClose: () => RatingPopup.close('rate-user'),
                  })
                }
              >
                Rate{' '}
                <Menu.ItemCommand>
                  <LuStar size={20} />
                </Menu.ItemCommand>
              </Menu.Item>
              <Menu.Item color="red" value="report-user">
                Report{' '}
                <Menu.ItemCommand>
                  <FiUserX size={20} />
                </Menu.ItemCommand>
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <RatingPopup.Viewport />
    </Box>
  );
};

export default AccountOptions;
