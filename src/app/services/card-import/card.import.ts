import { Injectable } from "@angular/core";
import { liveQuery } from "dexie";
import { db } from "../database/database.service";
import { Card } from "../../models/card";

interface DeckList {
    materialDeck: { [key: string]: string }[],
    mainDeck: { [key: string]: string }[],
    sideDeck: { [key: string]: string }[]
}


@Injectable({
    providedIn: 'root'
})
export class ImportService {

    cardQuery = liveQuery(() => db.card.toArray());
    cardList: Card[] = [];
    foundMaterial: boolean = false;
    foundMain: boolean = false;
    foundSide: boolean = false;

    loadCards() {
        this.cardQuery.subscribe({
            next: (cards) => {
                this.cardList = cards;
            }
        });
    }

    parseInput(input: string) {
        let deckList: DeckList = {
            mainDeck: [],
            materialDeck: [],
            sideDeck: []
        };
        let strings = input.split("\n");
        strings.forEach(string => {
            if (string.startsWith("# Material")) {
                this.foundMaterial = true;
                this.foundMain = false;
                this.foundSide = false;
            } else if (string.startsWith("# Main")) {
                this.foundMain = true;
                this.foundMaterial = false;
                this.foundSide = false;
            } else if (string.startsWith("# Sideboard")) {
                this.foundMain = false;
                this.foundMaterial = false;
                this.foundSide = true;
            }
            if (!string.startsWith('#') && string.length && this.foundMain) {
                const result: { [key: string]: string } = {};
                let res = string.split(/(\d+)/).filter(Boolean);
                const key = res[1].trim();
                const value = res[0]
                result[key] = value;
                deckList.mainDeck.push(result);
            }
            if (!string.startsWith('#') && string.length && this.foundMaterial) {
                const result: { [key: string]: string } = {};
                let res = string.split(/(\d+)/).filter(Boolean);
                const key = res[1].trim();
                const value = res[0]
                result[key] = value;
                deckList.materialDeck.push(result);
            }
            if (!string.startsWith('#') && string.length && this.foundSide) {
                const result: { [key: string]: string } = {};
                let res = string.split(/(\d+)/).filter(Boolean);
                const key = res[1].trim();
                const value = res[0]
                result[key] = value;
                deckList.sideDeck.push(result);
            }
        });
        return deckList;
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
