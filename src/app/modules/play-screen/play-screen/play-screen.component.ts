import { ChangeDetectorRef, Component, HostListener, Inject, inject, Input, ViewChild } from '@angular/core';
import { db } from '../../../services/database/database.service';
import { liveQuery } from 'dexie';
import { Deck } from '../../../models/deck';
import { Card } from '../../../models/card';
import { MatSidenav } from '@angular/material/sidenav';
import { RoutingService } from '../../../services/routing/routing.service';
import { Client, getStateCallbacks, Room } from 'colyseus.js';
import { ActivatedRoute, Router } from '@angular/router';
import { GameManager } from '../../../services/multiplayer/game-manager';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBar,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

interface Message {
  message: string,
  isEnemy: boolean
}

@Component({
  selector: 'app-play-screen',
  templateUrl: './play-screen.component.html',
  styleUrls: ['./play-screen.component.scss']
})
export class PlayScreenComponent {
  // Snack Bar
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  // Room logic
  decksQuery = liveQuery(() => db.decks.toArray());
  client = new Client('https://155-138-239-22.colyseus.dev');
  currentRoom: Room;
  roomId: string;
  roomName: string;
  decks: Deck[] = [];
  selectedDeck: Deck;
  mainDeck: Card[];
  materialDeck: Card[];
  loaded = false;
  hand: Card[];
  currentCard: Card;
  playerLife: number;
  enemyLife: number;
  @ViewChild('drawer') drawer: MatSidenav;
  @ViewChild('console') console: MatSidenav;
  consoleOpen: boolean = false;
  hoverCards: boolean = false;
  consoleMessages: Message[] = [];
  playerName: string;
  isP1: boolean = false;
  canSendMessage: boolean = true;
  enemyName: string;

  constructor(private routerService: RoutingService, private aRoute: ActivatedRoute, private gameManager: GameManager) { }

  async ngOnInit() {
    let storedDeckName = localStorage.getItem('selectedDeck')?.replace(/['"]+/g, '');
    this.playerName = localStorage.getItem("playerName")!;
    this.roomId = this.aRoute.snapshot.queryParamMap.get('roomId')!;
    this.client.joinById(this.roomId).then(res => {
      this.currentRoom = res;
      this.setPlayerLife(20);
      this.playerLife = 20;
      this.consoleMessages.push({
        message: this.playerName + " joined the room!",
        isEnemy: false,
      });
      this.currentRoom.send("send-message", {
        data: {
          message: this.playerName + " joined the room!",
          playerName: this.playerName
        }
      });
      const $ = getStateCallbacks(this.currentRoom);
      $(this.currentRoom.state)['players'].onAdd((player, sessionId) => {
        if (this.currentRoom.state.p1Id === sessionId) {
          this.isP1 = true;
        } else {
          this.playAudio("./assets/room-join.mp3");
        }
      });
      this.currentRoom.onMessage("message-sent", (data) => {
        this.openSnackBar(data.data.playerName);
        this.consoleMessages.push({
          message: data.data.message,
          isEnemy: true,
        });
      });
    });
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
    this.hand = [...drawnCards];
  }

  viewMaterialDeck() {

  }

  playAudio(src: string) {
    let audio = new Audio();
    audio.src = src;
    audio.load();
    audio.play();
  }

  setPlayerLife(value: number) {
    const $ = getStateCallbacks(this.currentRoom);
    $(this.currentRoom.state)['players'].onAdd((player, sessionId) => {
      this.currentRoom.send("set-life", { value: value });
    });
  }

  getPlayerLife() {
    this.playerLife = this.currentRoom.state.p1Life ? this.currentRoom.state.p1Life : 0;
  }

  getEnemyLife() {
    this.enemyLife = this.currentRoom.state.p2Life ? this.currentRoom.state.p2Life : 0;
  }

  setCurrentCard(card: Card) {
    this.currentCard = card;
  }

  openSnackBar(playerName: string) {
    this._snackBar.openFromComponent(PizzaPartyAnnotatedComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['play-snackbar'],
      verticalPosition: "top",
      data: playerName
    });
  }

  pushMessage(message: string) {
    if (this.canSendMessage) {
      this.consoleMessages.push({
        message: message,
        isEnemy: false
      });
      this.canSendMessage = false;
      this.currentRoom.send("send-message", { data: message });
      setTimeout(() => this.canSendMessage = true, 5000);
    }
  }

  @HostListener('contextmenu')
  showCardInfo() {
    this.drawer.toggle();
    return false;
  }

  toggleConsole() {
    this.console.toggle();
    this.consoleOpen = !this.consoleOpen;
  }

  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }

  navigateToPage(page: string) {
    this.routerService.navigateToPage(page);
  }

  surrender() {
    this.currentRoom.leave(true).then(() => {
      this.navigateToPage('/');
    })
  }

}

// Snackbar

@Component({
  selector: 'play-snackbar',
  template: `
    <span matSnackBarLabel>
        <span class="w-100 rounded-md text-white font-bold text-center">{{data}} joined the room!</span>
    </span>`,
  imports: [MatButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  standalone: true
})
export class PizzaPartyAnnotatedComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
  snackBarRef = inject(MatSnackBarRef);
}
