import { PokemonCard } from '@/types/pokemon-card'
import cvReadyPromise from '@techstark/opencv-js'

export type CardData = {
    hash: string
    hashBytes: Uint8Array
    card: PokemonCard
}

export type CardDataTwo = {
    hash: string
    hashBytes: string
    card: PokemonCard
}

export type CardDataObj = {
    [id: string]: CardData
}

export type CardDataObjTwo = {
    [id: string]: CardDataTwo
}

export interface PredictedImageResult {
    predictedCard?: CardData
    foundCardImage?: cvReadyPromise.Mat
    corners?: [number, number][]
}

export interface NormalizeCardResult {
    image: cvReadyPromise.Mat
    corners: [number, number][]
}

export type Corners = [
    [number, number],
    [number, number],
    [number, number],
    [number, number]
]

export enum rotation {
    NONE,
    CLOCKWISE,
    COUNTERCLOCKWISE,
    UPSIDE_DOWN
}

export type PredictedCards = { data: CardData; imageURL: string }[]
