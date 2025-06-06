import { Card } from "./card";

export interface Deck {
    name: string,
    main: Card[],
    material: Card[],
    side: Card[],
    isValid: boolean
}