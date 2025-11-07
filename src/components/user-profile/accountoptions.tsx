'use client';

import React from 'react';

import {
  Button
} from '@chakra-ui/react';
import { FiMoreVertical } from 'react-icons/fi';


const AccountOptions: React.FC = () => {
  return (
    <Button 
        position="absolute" 
        top={28}
        left={-2}
        rounded="sm"
        variant="ghost"
        >
            <FiMoreVertical size={24}/>
    </Button>
  );
};

export default AccountOptions;