import { Component } from '@angular/core';
import { Client, Room, SeatReservation } from 'colyseus.js';
import { RoutingService } from '../../../services/routing/routing.service';
import { db } from '../../../services/database/database.service';
import { liveQuery } from 'dexie';
import { Deck } from '../../../models/deck';
import { FormControl } from '@angular/forms';
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';

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
  matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  roomName: string = '';
  privateRoomName: string = '';
  roomPass: string = '';
  joinPass: string = '';
  isPrivate: boolean = false;
  validRoomPass: boolean = true;
  validRoomName: boolean = true;
  playerName: string | null;

  constructor(private routerService: RoutingService) { }

  ngOnInit() {
    this.loadDecks();
    this.playerName = localStorage.getItem('playerName');
  }

  ngAfterViewInit() {
    this.refreshRooms();
  }

  createRoom() {
    this.client.http.get('/room_list').then(res => {
      this.roomList = JSON.parse(res.data);
      this.roomList.forEach(room => {
        if (room.name === this.roomName) {
          this.validRoomName = false;
          return;
        }
      });
      if (this.matcher.hasMatch(this.roomName) || !this.roomName || this.roomName === '') {
        this.validRoomName = false;
        return;
      }
    });
    if (this.validRoomName) {
      this.client.http.post("/create_room", {
        body: {
          roomName: this.roomName,
          createdBy: this.playerName,
          roomPassword: this.isPrivate ? this.roomPass : null,
        }
      }).then((res) => {
        //this.client.joinById(res.data.roomId);
        this.roomName = '';
      });
    }
  }

  joinPrivateRoom() {
    if (!this.isPrivate || this.joinPass === '' || this.privateRoomName === '') {
      this.validRoomPass = false;
      return;
    }
    try {
      this.client.http.post("/join_private", {
        body: {
          roomName: this.privateRoomName,
          roomPassword: this.joinPass
        }
      }).then(res => {
        console.log(res);
        if (res.statusCode !== 401) {
          this.navigateToPage('play');
        }
      });
    } catch {
      this.validRoomPass = false;
    }
  }

  refreshRooms() {
    this.client.http.get('/room_list').then(res => this.roomList = JSON.parse(res.data));
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
