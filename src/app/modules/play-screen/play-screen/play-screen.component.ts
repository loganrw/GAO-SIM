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
  isP2: boolean,
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
  //client = new Client('https://155-138-239-22.colyseus.dev');
  //LOCAL
  client = new Client('http://localhost:2567');
  currentRoom: Room;
  roomId: string;
  roomName: string;
  decks: Deck[] = [];
  selectedDeck: Deck;
  loaded = false;
  hand: Card[];
  cardList: Card[];
  cardQuery = liveQuery(() => db.card.toArray());
  currentCard: Card;
  p1Life: number;
  p1MaxLife: number;
  p2Life: number;
  p2MaxLife: number;
  @ViewChild('drawer') drawer: MatSidenav;
  @ViewChild('console') console: MatSidenav;
  consoleOpen: boolean = false;
  hoverCards: boolean = false;
  consoleMessages: Message[] = [];
  combatMessages: Message[] = [];
  consoleChat: boolean = true;
  playerName: string;
  isP1: boolean = false;
  isP2: boolean = false;
  canSendMessage: boolean = true;
  isViewingMatDeck: boolean = false;
  p2Joined: boolean = false;
  emojiChat: boolean = false;
  // Turn ordering
  isP1Turn: boolean;
  isP2Turn: boolean;
  playerPlayField: Card[] = [];
  enemyPlayField: Card[] = [];
  showTurn = false;
  turnPhase = ["Wake Up", "Materialize", "Recollection", "Draw", "Main"];
  currentPhase: number;

  @ViewChildren("chatDiv") chatDiv: QueryList<ElementRef>;

  constructor(private routerService: RoutingService, private aRoute: ActivatedRoute, private gameManager: GameManager) { }

  async ngOnInit() {
    let storedDeckName = localStorage.getItem('selectedDeck')?.replace(/['"]+/g, '');
    this.playerName = localStorage.getItem("playerName")!;
    this.roomId = this.aRoute.snapshot.queryParamMap.get('roomId')!;
    this.loadCards();
    this.client.joinById(this.roomId).then(res => {
      this.currentRoom = res;
      this.consoleMessages.push({
        message: this.playerName + " joined the room!",
        isP2: false,
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
        this.setPlayerLife(0);
        if (!this.currentRoom.state.p2Id) {
          this.isP1 = true;
          this.getP1Life();
          this.p1MaxLife = 0;
        } else {
          if (!this.isP1) this.isP2 = true;
          this.playAudio("./assets/room-join.mp3");
          this.getP2Life();
          this.p2MaxLife = 0;
          setTimeout(() => {
            this.currentRoom.send("get-first-turn", {
              data: {
                excludeClient: false
              }
            });
          }, 1500);
          this.p2Joined = true;
        }
      });
      this.currentRoom.onMessage("phase-change", (data) => {
        this.currentPhase = data.phase;
        this.advancePhase();
      });
      this.currentRoom.onMessage("message-sent", (data) => {
        if (!this.p2Joined) {
          this.openSnackBar(data.data.playerName + " joined the Room!");
        }
        this.consoleMessages.push({
          message: data.data.message,
          isP2: true,
          isImage: data.data.isImage
        });
      });
      this.currentRoom.onMessage("changed-turn", (data) => {
        if (data.playerTurn == this.currentRoom.state.p1Id && this.isP1) {
          this.isP2Turn = false;
          this.isP1Turn = true;
        }
        if (data.playerTurn == this.currentRoom.state.p2Id && !this.isP1) {
          this.isP2Turn = true;
          this.isP1Turn = false;
        }
      });
      this.currentRoom.onMessage("p1-played", (data) => {
        if (this.isP1) return;
        const card = this.findCard(data.data.card, data.data.blob)!;
        if (card) this.enemyPlayField.push(card)
      });
      this.currentRoom.onMessage("p2-played", (data) => {
        if (!this.isP1) return;
        const card = this.findCard(data.data.card, data.data.blob)!;
        if (card) this.enemyPlayField.push(card)
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
            isP2: false,
            isImage: false
          });
          this.isP1Turn = true;
          this.isP2Turn = false;
          this.currentRoom.send("advance-phase");
          // You are player 2 and you go first
        } else if (data.firstTurn === this.currentRoom.state.p2Id && this.isP2) {
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
              isP2: false,
              isImage: false
            });
            this.isP1Turn = true;
            this.isP2Turn = false;
            this.currentRoom.send("advance-phase");
          }
          // You do not go first
        } else {
          this.openSnackBar("Enemy goes first!");
          if (this.isP1) {
            this.isP1Turn = false;
            this.isP2Turn = true;
          }
          if (this.isP2) {
            this.isP2Turn = false;
            this.isP1Turn = true;
          }
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

  loadCards() {
    this.cardQuery.subscribe({
      next: (cards) => {
        this.cardList = cards;
      }
    });
  }

  calcLife(max: number, current: number) {
    // do normal percentage math but the svg circle is reversed(0 is 100%)
    return ((current / max) * 100) - 100 * -1;
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

  findCard(cardName: string, blob: string) {
    let card = this.cardList.find(card => card.name.toLowerCase() === cardName.toLowerCase());
    if (card) {
      const cardBlob = this.base64toBlob(blob);
      card.image = cardBlob;
    }
    return card;
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

  getP1Life() {
    this.p1Life = this.currentRoom.state.p1Life ? this.currentRoom.state.p1Life : 0;
  }

  getP2Life() {
    this.p2Life = this.currentRoom.state.p2Life ? this.currentRoom.state.p2Life : 0;
  }

  setCurrentCard(card: Card) {
    this.currentCard = card;
  }

  cardClicked(card: Card) {
    if (this.isP1Turn) {
      const index = this.hand.indexOf(card);
      this.hand.splice(index, 1);
      this.playerPlayField.push(card);
      // Encode card blob then send it to server
      this.blobToBase64(card.image).then(base64Data => {
        this.currentRoom.send("card-played", {
          card: card.name,
          blob: base64Data,
        });
      });
    }
  }

  blobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        let base64String = reader.result as string;
        base64String = base64String.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(blob);
    });
  }

  base64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
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
        isP2: false,
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

  advancePhase() {
    console.log(this.isP1, this.isP2, this.isP1Turn, this.isP2Turn);
    this.showTurn = true;
    setTimeout(() => {
      this.showTurn = false;
    }, 1000);
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
