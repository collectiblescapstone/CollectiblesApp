import { PokemonCard } from '@/types/pokemon-card';
import cvReadyPromise from '@techstark/opencv-js';

export type CardData = {
  hash: string;
  hashBits: string;
  card: PokemonCard;
};

export type CardDataObj = {
  [id: string]: CardData;
};

export interface ProcessedImageResult {
  predictedCard?: CardData;
  foundCardImage?: cvReadyPromise.Mat;
  corners?: [number, number][];
}

export interface NormalizeCardResult {
  image: cvReadyPromise.Mat;
  corners: [number, number][];
}
