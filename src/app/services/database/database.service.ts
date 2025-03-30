import Dexie, { Table } from 'dexie';
import { Card } from '../../models/card';
import { Deck } from '../../models/deck';

export class AppDB extends Dexie {
    card!: Table<Card, number>;
    decks!: Table<Deck, number>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(3).stores({
            card: '++id',
            decks: '++id',
        });
    }
}

export const db = new AppDB();

