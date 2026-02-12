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

export type corners = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

export type PredictedImageResult = {
  predictedCard?: CardData;
  foundCardImage?: cvReadyPromise.Mat;
  corners?: corners;
};

export type NormalizeCardResult = {
  image: cvReadyPromise.Mat;
  corners: corners;
};

// make a new result type

export enum rotation {
  NONE,
  CLOCKWISE,
  COUNTERCLOCKWISE,
  UPSIDE_DOWN,
}
