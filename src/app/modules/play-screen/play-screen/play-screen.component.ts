import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, inject, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
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
  isEnemy: boolean,
  isImage: boolean
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
  // PROD
  client = new Client('https://155-138-239-22.colyseus.dev');
  //LOCAL
  //client = new Client('http://localhost:2567');
  currentRoom: Room;
  roomId: string;
  roomName: string;
  decks: Deck[] = [];
  selectedDeck: Deck;
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
  isViewingMatDeck: boolean = false;
  enemyJoined: boolean = false;
  emojiChat: boolean = false;
  // Turn ordering
  isPlayersTurn: boolean;
  isEnemyTurn: boolean;

  @ViewChildren("chatDiv") chatDiv: QueryList<ElementRef>;

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
        isImage: false
      });
      this.currentRoom.send("send-message", {
        data: {
          message: this.playerName + " joined the room!",
          playerName: this.playerName,
          excludeClient: true
        }
      });
      const $ = getStateCallbacks(this.currentRoom);
      $(this.currentRoom.state)['players'].onAdd((player, sessionId) => {
        if (!this.currentRoom.state.p2Id) {
          this.isP1 = true;
        } else {
          this.playAudio("./assets/room-join.mp3");
          setTimeout(() => {
            this.currentRoom.send("get-first-turn", {
              data: {
                excludeClient: false
              }
            })
          }, 1500);
          this.enemyJoined = true;
        }
      });
      this.currentRoom.onMessage("message-sent", (data) => {
        if (!this.enemyJoined) {
          this.openSnackBar(data.data.playerName + " joined the Room!");
        }
        this.consoleMessages.push({
          message: data.data.message,
          isEnemy: true,
          isImage: data.data.isImage
        });
      });
      this.currentRoom.onMessage("turn-order", (data) => {
        // You are player 1 and you go first
        if (data.firstTurn === this.currentRoom.state.p1Id && this.isP1) {
          this.openSnackBar("You go first!");
          this.currentRoom.send("send-message", {
            data: {
              message: this.playerName + " goes first!",
              excludeClient: true
            }
          });
          this.consoleMessages.push({
            message: "You go first!",
            isEnemy: false,
            isImage: false
          });
          this.isPlayersTurn = true;
          this.isEnemyTurn = false;
          // You are player 2 and you go first
        } else if (data.firstTurn === this.currentRoom.state.p2Id && !this.isP1) {
          {
            this.openSnackBar("You go first!");
            this.currentRoom.send("send-message", {
              data: {
                message: this.playerName + " goes first!",
                excludeClient: true
              }
            });
            this.consoleMessages.push({
              message: "You go first!",
              isEnemy: false,
              isImage: false
            });
            this.isPlayersTurn = true;
            this.isEnemyTurn = false;
          }
          // You do not go first
        } else {
          this.openSnackBar("Enemy goes first!");
        }
      });
    });
    await db.decks.toArray().then(res => {
      this.selectedDeck = res.find(deck => deck.name == storedDeckName) as Deck;
      this.shuffleDeck();
      this.drawCard(7);
      this.loaded = true;
    });
  }

  ngAfterViewInit() {
    this.chatDiv.changes.subscribe(() => {
      if (this.chatDiv && this.chatDiv.last) {
        this.chatDiv.last.nativeElement.focus();
      }
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
    this.isViewingMatDeck = !this.isViewingMatDeck;
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

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: this.durationInSeconds * 1000,
      panelClass: ['play-snackbar'],
      verticalPosition: "top",
      data: message
    });
  }

  pushMessage(message: string, isImage: boolean) {
    if (this.canSendMessage) {
      this.consoleMessages.push({
        message: message,
        isEnemy: false,
        isImage: isImage
      });
      this.currentRoom.send("send-message", {
        data: {
          message: message,
          excludeClient: true,
          isImage: isImage
        }
      });
      this.canSendMessage = false;
      if (this.emojiChat) this.emojiChat = false;
    }
    setTimeout(() => this.canSendMessage = true, 5000);
  }

  scrollTo(event: any) {
    let element = event.target as HTMLElement;
    element.scrollIntoView();
  }

  @HostListener('contextmenu')
  showCardInfo() {
    this.drawer.toggle();
    return false;
  }

  @HostListener('click', ['$event'])
  toggleMatDeck(event: any) {
    const clickedElement = event.target as HTMLElement;
    if (!(clickedElement.id == 'matDeck' || clickedElement.id == 'matView')) this.isViewingMatDeck = false;
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
        <span class="w-100 rounded-md text-white font-bold text-center">{{data}}</span>
    </span>`,
  imports: [MatButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  standalone: true
})
export class SnackBarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
  snackBarRef = inject(MatSnackBarRef);
}
