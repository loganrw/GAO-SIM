import { Injectable } from "@angular/core";
import { liveQuery } from "dexie";
import { db } from "../database/database.service";
import { Card } from "../../models/card";
import { Deck } from "../../models/deck";


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    cardQuery = liveQuery(() => db.card.toArray());
    cardList: Card[] = [];

    loadCards() {
        this.cardQuery.subscribe({
            next: (cards) => {
                this.cardList = cards;
            }
        });
    }

    parseInput(input: string) {
        const result: { [key: string]: string } = {};
        let strings = input.split("\n");
        strings.forEach(string => {
            if (!string.startsWith('#') && string.length) {
                let res = string.split(/(\d+)/).filter(Boolean);
                const key = res[1].trim();
                const value = res[0]
                result[key] = value;
            }
        });
        return result;
    }

    getCard(cardName: string): Card {
        let deckCard = this.cardList.find(card => card.name.toLowerCase() === cardName.toLowerCase());
        if (deckCard) {
            return deckCard
        } else {
            return {} as Card;
        }
    }

}
