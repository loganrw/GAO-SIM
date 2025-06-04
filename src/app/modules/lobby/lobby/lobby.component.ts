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
import { Card } from '../../../models/card';
import { Subscription, interval } from 'rxjs';

class CustomRoom extends Room {
  clients: number;
  maxClients: number;
}

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent {
  client = new Client('https://155-138-239-22.colyseus.dev');
  roomList: CustomRoom[] = [];
  joinedRoom: Room;
  decksQuery = liveQuery(() => db.decks.toArray());
  decks: Deck[] = [];
  selectedDeck: Deck;
  deckSelect = new FormControl('');
  headerLinks = ['home', 'decks', 'options', 'ai'];
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
  refreshLobbies: Subscription;

  constructor(private routerService: RoutingService) { }

  ngOnInit() {
    this.loadDecks();
    this.refreshRooms();
    this.playerName = localStorage.getItem('playerName');
    this.refreshLobbies = interval(1000).subscribe(() => { this.refreshRooms(); });
  }

  createRoom() {
    if (!this.selectedDeck) {
      alert("Select or create a deck before joining a game.")
      return;
    }
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
      }).then(async (res) => {
        if (res.statusCode !== 401) {
          this.navigateToPage("/play", { roomId: res.data.roomId });
        }
      });
    }
  }

  joinRoom(room: Room) {
    if (!this.selectedDeck) {
      alert("Select or create a deck before joining a game.")
      return;
    }
    this.navigateToPage("/play", { roomId: room.roomId });
  }

  joinPrivateRoom() {
    if (!this.selectedDeck) {
      alert("Select or create a deck before joining a game.")
      return;
    }
    if (this.joinPass === '' || this.privateRoomName === '') {
      this.validRoomPass = false;
      return;
    }
    this.client.http.post("/join_private", {
      body: {
        roomName: this.privateRoomName,
        roomPassword: this.joinPass
      }
    }
    ).then(res => {
      let roomId = JSON.parse(res.data);
      this.navigateToPage("/play", { roomId: roomId })
    }).catch(err => {
      this.validRoomPass = false;
    });
  }

  refreshRooms() {
    this.client.http.get('/room_list').then(res => this.roomList = JSON.parse(res.data));
  }

  joinAiGame() {
    if (!this.selectDeck) {
      alert("Select or create a deck before joining a game.")
      return;
    }
  }

  loadDecks() {
    this.decksQuery.subscribe(decks => {
      this.decks = decks;
      this.selectedDeck = this.decks[0];
      localStorage.setItem('selectedDeck', JSON.stringify(this.decks[0]?.name));
    });
  }

  selectDeck(event: any) {
    this.selectedDeck = event.value;
    localStorage.setItem('selectedDeck', JSON.stringify(event.value.name));
  }

  navigateToPage(page: string, data?: any) {
    this.routerService.navigateToPage(page, data);
  }
}
