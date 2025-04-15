import { Component } from '@angular/core';
import { Client, Room } from 'colyseus.js';
import { RoutingService } from '../../../services/routing/routing.service';
import { db } from '../../../services/database/database.service';
import { liveQuery } from 'dexie';
import { Deck } from '../../../models/deck';
import { Card } from '../../../models/card';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  client = new Client('ws://155-138-239-22.colyseus.dev:2567');
  roomList: Room[] = [];
  decksQuery = liveQuery(() => db.decks.toArray());
  decks: Deck[] = [];
  selectedDeck: Deck;
  deckSelect = new FormControl('');
  headerLinks = ['home', 'decks', 'options'];


  constructor(private routerService: RoutingService) { }

  ngOnInit() {
    let playerName = localStorage.getItem('playerName');
    this.client.http.post("/create_room", {
      body: {
        roomName: playerName + "'s room"
      }
    });
    this.loadDecks();
  }

  ngAfterViewInit() {
    this.refreshRooms();
  }

  refreshRooms() {
    this.client.http.get('/room_list').then(res => { this.roomList = JSON.parse(res.data); console.log(res.data) });
  }


  loadDecks() {
    this.decksQuery.subscribe(decks => {
      this.decks = decks;
      this.selectedDeck = this.decks[0];
    });
  }

  selectDeck(deck: Deck) {
    this.selectedDeck = deck;
  }

  navigateToPage(page: string) {
    this.routerService.navigateToPage(page);
  }
}
