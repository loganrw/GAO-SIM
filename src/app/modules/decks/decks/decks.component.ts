import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Card } from '../../../models/card';
import { liveQuery } from 'dexie';
import { db } from '../../../services/database/database.service';
import { FormControl } from '@angular/forms';
import { Deck } from '../../../models/deck';
import { MatDialog } from '@angular/material/dialog';
import { DeckModalComponent } from '../../../components/deck-modal/deck.modal.component';
import { ImportModalComponent } from '../../../components/import-modal/import.modal.component';
import { ImportService } from '../../../services/card-import/card.import';
import { MatSidenav } from '@angular/material/sidenav';


interface CardCount {
  [key: string]: number
}

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrl: './decks.component.scss'
})
export class DecksComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  loaded = false;
  cardQuery = liveQuery(() => db.card.toArray());
  decksQuery = liveQuery(() => db.decks.toArray());
  cardList: Card[] = [];
  decksList: Deck[] = [];
  // Filtering
  searchInput = ''
  filteredCards: Card[] = [];
  cardType = new FormControl('');
  cardSpeed = new FormControl('');
  cardCost = new FormControl('');
  cardClass = new FormControl('');
  cardElement = new FormControl('');
  selectedTypes: string[] = [];
  selectedClass: string[] = [];
  selectedCostMemory: string[] = [];
  selectedCostReserve: string[] = [];
  selectedSpeed: boolean[] = [];
  selectedElements: string[] = [];
  cardTypes: string[] = ['champion', 'ally', 'action', 'attack', 'item', 'weapon', "domain", "phantasia", "regalia"];
  cardCosts: string[] = ["15", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "0", "-1"];
  cardClasses: string[] = ['assassin', 'cleric', 'guardian', 'mage', 'ranger', 'tamer', 'warrior', 'spirit'];
  cardElements: string[] = ['norm', 'water', 'wind', 'crux', 'exia', 'astra', 'umbra', 'tera', 'arcane', 'luxem', 'neos']
  // fast speeds are true, slow is false, everything else is null
  cardSpeeds: boolean[] = [true, false];

  //Deck Creation
  mainDeck: Card[] = [];
  materialDeck: Card[] = [];
  sideDeck: Card[] = [];
  isCreatingDeck: boolean = false;
  mainDeckDisplayCount: CardCount = {};
  materialDeckDisplayCount: CardCount = {};
  sideDeckDisplayCount: CardCount = {};
  mainDeckDisplay: string[] = [];
  materialDeckDisplay: string[] = [];
  sideDeckDisplay: string[] = [];
  countsMaterial: number[] = [];
  countsMain: number[] = [];
  countsSide: number[] = [];
  mainDeckCount: number = 0;
  materialDeckCount: number = 0;
  sideDeckCount: number = 0;
  // Track card elements to make sure the player only uses elements for their champion. normal element is always activated
  activeCardElements: string[] = ["NORM"];
  deckName: string = '';
  newDeckName: string = '';
  // Deck editing
  isEditingDeck: boolean = false;
  originalDeck: Deck = {} as Deck;
  // Side drawer for card display when clicked
  isCardOpen = true;
  @ViewChild('drawer') drawer: MatSidenav;
  selectedCard: Card;
  // header links
  headerLinks = ['home', 'play', 'options', 'ai'];
  // Deck Validation




  constructor(private importService: ImportService) { }

  async ngOnInit() {
    this.loadCards();
    this.loadDecks();
    this.importService.loadCards();
  }

  loadDecks() {
    this.decksQuery.subscribe(decks => {
      this.decksList = decks;
    });
  }

  loadCards() {
    this.cardQuery.subscribe({
      next: (cards) => {
        this.cardList = cards;
        this.filteredCards = cards;
        this.loaded = true;
      }
    });
  }

  searchCards() {
    this.selectedTypes = [];
    this.selectedCostMemory = [];
    this.selectedCostReserve = [];
    this.selectedSpeed = [];
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = card.name.toLowerCase().includes(this.searchInput.toLowerCase());
      if (!filterRes) {
        this.filteredCards = this.cardList;
        return;
      } else return filterRes;
    });
  }

  filterCards() {
    this.filteredCards = this.cardList;
    if (this.selectedTypes.length > 0) {
      this.filteredCards = this.filteredCards.filter((card) => {
        return card.types.find((type => this.selectedTypes.includes(type.toLowerCase())));
      });
    }
    if (this.selectedClass.length > 0) {
      this.filteredCards = this.filteredCards.filter((card) => {
        return card.classes.find((className => this.selectedClass.includes(className.toLowerCase())));
      });
    }
    if (this.selectedElements.length > 0) {
      this.filteredCards = this.filteredCards.filter((card) => {
        return this.selectedElements.includes(card.element.toLowerCase());
      });
    }
    if (this.selectedCostMemory.length > 0) {
      this.filteredCards = this.filteredCards.filter((card) => {
        return this.selectedCostMemory.includes(card.cost_memory?.toString());
      });
    }
    if (this.selectedCostReserve.length > 0) {
      this.filteredCards = this.filteredCards.filter((card) => {
        return this.selectedCostReserve.includes(card.cost_reserve?.toString());
      });
    }
    if (this.selectedSpeed.length > 0) {
      this.filteredCards = this.filteredCards.filter((card) => {
        return this.selectedSpeed.includes(card.speed);
      });
    }
  }

  getSpeed(speed: boolean): string {
    return speed == true ? 'Fast' : 'Slow';
  }

  identifyList(index: number, card: Card) {
    return `${card.uuid}${card.name}`;
  }

  titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  createDeck() {
    this.resetDeckChoices();
    this.isCreatingDeck = true;
  }

  addToDeck(card: Card) {
    if ((card.types.includes("CHAMPION") || card.types.includes("REGALIA") || card.cost_memory) && !this.materialDeck.includes(card) && this.materialDeck.length < 15) {
      if (card.types.includes("CHAMPION")) this.activeCardElements.push(card.element);
      if (!this.materialDeckDisplayCount[JSON.stringify(card.name)]) {
        this.materialDeck.push(card);
        this.materialDeckCount++;
      }
      this.updateMatDeckDisplay();
    } else if (!card.types.includes("CHAMPION") && !card.types.includes("REGALIA") && this.activeCardElements.includes(card.element || "NORM")) {
      if (!this.mainDeckDisplayCount[JSON.stringify(card.name)] || this.mainDeckDisplayCount[JSON.stringify(card.name)] < 4) {
        this.mainDeck.push(card);
        this.mainDeckCount++;
      }
      this.updateMainDeckDisplay();
    }
  }

  addToSideDeck(card: Card) {
    let sideDeckCost = (card.types.includes("CHAMPION") || card.types.includes("REGALIA")) ? 3 : 1;
    if (this.sideDeckCount < 15 && (this.sideDeckCount + sideDeckCost < 15) && this.sideDeck.length < 15) {
      this.sideDeck.push(card);
      this.sideDeckCount += sideDeckCost;
    }
    this.updateSideDeckDisplay();
  }

  updateSideDeckDisplay() {
    this.sideDeckDisplayCount = this.countDuplicates(this.sideDeck);
    this.sideDeckDisplay = Object.keys(this.sideDeckDisplayCount);
    this.countsSide = Object.values(this.sideDeckDisplayCount);
  }

  getSideDeckTotal(): number {
    let sideDeckTotal = 0;
    this.sideDeck.forEach(card => {
      let sideDeckCost = (card.types.includes("CHAMPION") || card.types.includes("REGALIA")) ? 3 : 1;
      sideDeckTotal += sideDeckCost;
    })
    return sideDeckTotal;
  }

  updateMainDeckDisplay() {
    this.mainDeckDisplayCount = this.countDuplicates(this.mainDeck);
    this.mainDeckDisplay = Object.keys(this.mainDeckDisplayCount);
    this.countsMain = Object.values(this.mainDeckDisplayCount);
  }

  updateMatDeckDisplay() {
    this.materialDeckDisplayCount = this.countDuplicates(this.materialDeck);
    this.materialDeckDisplay = Object.keys(this.materialDeckDisplayCount);
    this.countsMaterial = Object.values(this.materialDeckDisplayCount);
  }

  trimCardName(cardName: String) {
    return cardName.replace(/['"]+/g, '');
  }

  cancelCreate() {
    if (this.isEditingDeck) {
      this.mainDeck = this.originalDeck.main;
      this.materialDeck = this.originalDeck.material;
      this.sideDeck = this.originalDeck.side;
      this.newDeckName = this.deckName;
      this.saveDeck();
    } else {
      // reset the deck info
      this.isCreatingDeck = false;
      this.resetDeckChoices();
    }
  }

  resetDeckChoices() {
    this.mainDeck = [];
    this.materialDeck = [];
    this.sideDeck = [];
    this.countsMain = [];
    this.countsMaterial = [];
    this.mainDeckDisplay = [];
    this.materialDeckDisplay = [];
    this.sideDeckDisplay = [];
    this.mainDeckCount = 0;
    this.materialDeckCount = 0;
    this.sideDeckCount = 0;
  }

  countDuplicates(arr: Card[]) {
    const counts: { [key: string]: number } = {};
    for (const item of arr) {
      const key = JSON.stringify(item.name);
      counts[key] = (counts[key] || 0);
      if ((item.types.includes("CHAMPION") || item.cost_memory) && !this.materialDeck.includes(item) && this.materialDeck.length < 15 && counts[key] < 1) {
        counts[key] += 1;
      }
      else if (counts[key] <= 3) {
        counts[key] += 1;
      }
    }
    return counts;
  }

  checkValidDeck(deck: Deck): boolean {
    if (deck.main.length < 60) {
      return false;
    } else if (!deck.material.find((card) => { return (card.types.includes("CHAMPION") && card.level === 0) })) {
      return false;
    } else {
      return true;
    }
  }

  async saveDeck() {
    this.isCreatingDeck = false;
    let deckName: string;
    if (this.deckName === this.newDeckName && this.newDeckName.length > 0 && this.deckName !== '') {
      deckName = this.newDeckName;
    } else {
      deckName = this.deckName;
    }
    let deck: Deck = {
      name: deckName,
      main: this.mainDeck,
      material: this.materialDeck,
      side: this.sideDeck,
      isValid: false,
    };
    deck.isValid = this.checkValidDeck(deck);
    if (this.isEditingDeck) {
      await db.decks.get({ name: this.deckName }).then(async (dbDeck: any) => {
        if (deck) await db.decks.update(dbDeck.id, {
          name: deckName,
          main: this.mainDeck,
          material: this.materialDeck,
          side: this.sideDeck,
          isValid: deck.isValid,
        });
        this.isEditingDeck = false;
        this.loadDecks();
      });
    } else {
      await db.decks.add(deck);
    }
    this.loadDecks();
  }

  async deleteDeck(deck: Deck) {
    await db.decks.where("name").anyOf(deck.name).delete();
    this.loadDecks();
  }

  editDeck(deck: Deck) {
    this.originalDeck = structuredClone(deck);
    this.mainDeck = deck.main;
    this.materialDeck = deck.material;
    this.sideDeck = deck.side;
    this.deckName = deck.name;
    this.mainDeckCount = this.mainDeck.length;
    this.materialDeckCount = this.materialDeck.length;
    this.sideDeckCount = this.getSideDeckTotal();
    this.updateMainDeckDisplay();
    this.updateMatDeckDisplay();
    this.updateSideDeckDisplay();
    this.isCreatingDeck = true;
    this.isEditingDeck = true;
  }

  removeCard(cardName: string, deck: string) {
    if (deck === 'main') {
      let index;
      let foundCard = this.mainDeck.find(card => card.name.toLowerCase() == this.trimCardName(cardName.toLowerCase()));
      if (foundCard) {
        index = this.mainDeck.indexOf(foundCard, 0);
        this.mainDeck.splice(index, 1);
        this.mainDeckCount--;
        this.mainDeckDisplayCount = this.countDuplicates(this.mainDeck);
        if (foundCard && !this.mainDeckDisplayCount[foundCard.name]) this.mainDeckDisplay = Object.keys(this.mainDeckDisplayCount);
        this.countsMain = Object.values(this.mainDeckDisplayCount);
      }
    } else if (deck === 'material') {
      let foundCard = this.materialDeck.find(card => card.name.toLowerCase() == this.trimCardName(cardName.toLowerCase()));
      this.materialDeck = this.materialDeck.filter(card => card !== foundCard);
      this.materialDeckCount--;
      this.updateMatDeckDisplay();
    } else if (deck === 'side') {
      let index;
      let foundCard = this.sideDeck.find(card => card.name.toLowerCase() == this.trimCardName(cardName.toLowerCase()));
      if (foundCard) {
        index = this.sideDeck.indexOf(foundCard, 0);
        this.sideDeck.splice(index, 1);
        let sideDeckCost = (foundCard?.types.includes("CHAMPION") || foundCard?.types.includes("REGALIA")) ? 3 : 1;
        this.sideDeckCount -= sideDeckCost;
        this.sideDeckDisplayCount = this.countDuplicates(this.sideDeck);
        if (foundCard && !this.sideDeck[foundCard.name as any]) this.sideDeckDisplay = Object.keys(this.sideDeckDisplayCount);
        this.countsSide = Object.values(this.sideDeckDisplayCount);
      }
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string) {
    if (this.isEditingDeck) {
      this.saveDeck();
      return;
    }
    let dialogRef = this.dialog.open(DeckModalComponent, {
      width: '400px',
      height: '200px',
      enterAnimationDuration,
      exitAnimationDuration,
      data: this.decksList
    });
    dialogRef.afterClosed().subscribe(newDeckName => {
      if (newDeckName && newDeckName !== '') {
        this.deckName = newDeckName;
        this.saveDeck();
      }
    });
  }

  replaceNegative(cost: string) {
    if (cost === "-1") return "X";
    else return cost;
  }

  importDeck(enterAnimationDuration: string, exitAnimationDuration: string) {
    let importedDeck: Deck = {
      name: 'TEST',
      main: [],
      material: [],
      side: [],
      isValid: false,
    };
    let dialogRef = this.dialog.open(ImportModalComponent, {
      width: '500px',
      height: '500px',
      enterAnimationDuration,
      exitAnimationDuration
    });
    dialogRef.afterClosed().subscribe(deckList => {
      if (deckList && deckList !== '') {
        let result = this.importService.parseInput(deckList);
        let material = this.parseImportedDeck(result.materialDeck);
        let main = this.parseImportedDeck(result.mainDeck);
        let side = this.parseImportedDeck(result.sideDeck);
        importedDeck.main = main;
        importedDeck.material = material;
        importedDeck.side = side;
        this.materialDeck = importedDeck.material;
        this.mainDeck = importedDeck.main;
        this.sideDeck = importedDeck.side;
        this.deckName = importedDeck.material[0].name;
        this.saveDeck();
      }
    });
  }

  parseImportedDeck(cards: any) {
    let result: Card[] = [];
    cards.forEach((card: any) => {
      let cardName = Object.keys(card)[0];
      let cardCount: number = Object.values(card)[0] as number;
      let foundCard = this.importService.getCard(cardName);
      for (let i = 0; i < cardCount; i++) result.push(foundCard);
    });
    return result;
  }

  showCardInfo(card: Card, altImage: Blob | null) {
    this.selectedCard = card;
    if (altImage) this.selectedCard.image = altImage;
    this.drawer.toggle();
  }

  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }
}
