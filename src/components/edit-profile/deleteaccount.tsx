'use client';

import React from 'react';

import {
  Button
} from '@chakra-ui/react';


const DeleteAccount: React.FC = () => {

  const deletepressed = () => {
      // Sign out logic here
  }

  return (
    <Button variant="solid" colorPalette="red" size="lg" onClick={deletepressed}>
        Delete my account
    </Button>
  );
};
    
export default DeleteAccount;