import Dexie, { Table } from 'dexie';
import { Card } from '../../models/card';

export class AppDB extends Dexie {
    card!: Table<Card, number>;

    constructor() {
        super('ngdexieliveQuery');
        this.version(3).stores({
            card: '++id',
        });
    }
}

export const db = new AppDB();

