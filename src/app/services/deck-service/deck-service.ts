import { Injectable } from '@angular/core';
import { Card } from '../../models/card';


@Injectable({
    providedIn: 'root'
})
export class DeckService {

    drawCard(deck: Card[], count: number) {
        let cardsReturn: Card[] = [];
        for (let i = 0; i < count; i++) {
            cardsReturn.push(deck[i]);
        }
        return cardsReturn;
    }
}
