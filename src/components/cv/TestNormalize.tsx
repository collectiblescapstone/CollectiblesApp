import { useState } from 'react';
import Normalize from './Normalize';

import { Button } from '@chakra-ui/react';


export default function TestNormalize() {
  const [currentImage, setCurrentImage] = useState('/card2.jpg');

  const toggleImage = () =>
    setCurrentImage((prev) =>
      prev === '/card1.jpg' ? '/card2.jpg' : (prev === '/card2.jpg' ? '/card3.jpg' : '/card1.jpg')
    );

  return (
    <div>
      <Button mt={4} onClick={toggleImage}>
        Swap Card
      </Button>

      <Normalize image={currentImage} />
    </div>
  );
}
