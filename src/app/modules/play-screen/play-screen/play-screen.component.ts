import { Component, HostListener, ViewChild } from '@angular/core';
import { db } from '../../../services/database/database.service';
import { liveQuery } from 'dexie';
import { Deck } from '../../../models/deck';
import { Card } from '../../../models/card';
import { DeckService } from '../../../services/deck-service/deck-service';
import { MatSidenav } from '@angular/material/sidenav';
import { RoutingService } from '../../../services/routing/routing.service';
import { Client, Room } from 'colyseus.js';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-play-screen',
  templateUrl: './play-screen.component.html',
  styleUrls: ['./play-screen.component.scss']
})
export class PlayScreenComponent {


  decksQuery = liveQuery(() => db.decks.toArray());
  client = new Client('https://155-138-239-22.colyseus.dev');
  currentRoom: Room;
  roomId: string;
  roomName: string;
  isPrivate: string;
  passValid: boolean = false;
  roomPassword: string;
  decks: Deck[] = [];
  selectedDeck: Deck;
  mainDeck: Card[];
  materialDeck: Card[];
  loaded = false;
  hand: Card[];
  currentCard: Card;
  @ViewChild('drawer') drawer: MatSidenav;
  hoverCards: boolean = false;

  constructor(private deckService: DeckService, private routerService: RoutingService, private aRoute: ActivatedRoute) { }

  async ngOnInit() {
    let storedDeckName = localStorage.getItem('selectedDeck')?.replace(/['"]+/g, '');
    this.roomId = this.aRoute.snapshot.queryParamMap.get('roomId')!;
    this.isPrivate = this.aRoute.snapshot.queryParamMap.get('private')!;
    if (this.isPrivate === "true") {
      this.roomPassword = atob(this.aRoute.snapshot.queryParamMap.get('rp')!);
      this.roomName = this.aRoute.snapshot.queryParamMap.get('rn')!;
      this.joinPrivateRoom();
    } else {
      this.client.joinById(this.roomId).then(res => this.currentRoom = res);
    }
    await db.decks.toArray().then(res => {
      this.selectedDeck = res.find(deck => deck.name == storedDeckName) as Deck;
      this.shuffleDeck();
      this.drawCard(7);
    });
  }

  shuffleDeck() {
    for (let i = 0; i < this.selectedDeck.main.length; i++) {
      // picks the random number between 0 and length of the deck
      let shuffle = Math.floor(Math.random() * (this.selectedDeck.main.length));

      //swap the current with a random position
      [this.selectedDeck.main[i], this.selectedDeck.main[shuffle]] = [this.selectedDeck.main[shuffle], this.selectedDeck.main[i]];
    }
  }

  drawCard(count: number) {
    let drawnCards = this.selectedDeck.main.splice(0, count);
    console.log(drawnCards);
    this.hand = [...drawnCards];
  }

  viewMaterialDeck() {

  }

  setCurrentCard(card: Card) {
    this.currentCard = card;
  }

  @HostListener('contextmenu')
  showCardInfo() {
    this.drawer.toggle();
    return false;
  }

  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }

  navigateToPage(page: string) {
    this.routerService.navigateToPage(page);
  }

  joinPrivateRoom() {
    this.client.http.post("/join_private", {
      body: {
        roomName: this.roomName,
        roomPassword: this.roomPassword
      }
    }).then(res => {
      if (res.statusCode == 401) {
        this.passValid = true;
      }
    });
  }

  surrender() {
    this.currentRoom.leave(true).then(() => {
      this.navigateToPage('/');
    })
  }

}
