import { Component, inject, OnInit } from '@angular/core';
import { Card } from '../../../models/card';
import { liveQuery } from 'dexie';
import { db } from '../../../services/database/database.service';
import { FormControl } from '@angular/forms';
import { Deck } from '../../../models/deck';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from '../../../components/modal/modal.component';


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
  selectedCost: string[] = [];
  selectedSpeed: string[] = [];
  selectedElements: string[] = [];
  cardTypes: string[] = ['champion', 'ally', 'action', 'attack', 'item', 'weapon', "domain", "phantasia", "regalia"];
  cardCosts: string[] = ["12", "10", "9", "8", "7", "3", "2", "1", "0"];
  cardClasses: string[] = ['assassin', 'cleric', 'guardian', 'mage', 'ranger', 'tamer', 'warrior', 'spirit'];
  cardElements: string[] = ['norm', 'water', 'wind', 'crux', 'exia', 'astra', 'umbra', 'tera', 'arcane', 'luxem', 'neos']
  // fast speeds are true, slow is false, everything else is null
  cardSpeeds: boolean[] = [true, false];

  //Deck Creation
  mainDeck: Card[] = [];
  materialDeck: Card[] = [];
  isCreatingDeck: boolean = false;
  mainDeckDisplayCount: CardCount = {};
  materialDeckDisplayCount: CardCount = {};
  mainDeckDisplay: string[] = [];
  materialDeckDisplay: string[] = [];
  countsMaterial: number[] = [];
  countsMain: number[] = [];
  mainDeckCount: number = 0;
  materialDeckCount: number = 0;
  // Track card elements to make sure the player only uses elements for their champion. normal element is always activated
  activeCardElements: string[] = ["NORM"];
  deckName: string = '';

  ngOnInit(): void {
    this.loadCards();
    this.loadDecks();
  }

  loadDecks(){
    this.decksQuery.subscribe({
      next: (decks) => {
        console.log(decks)
        this.decksList = decks;
        this.loaded = true;
      }
    });
  }

  loadCards(){
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
    this.selectedCost = [];
    this.selectedSpeed = [];
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = card.name.toLowerCase().includes(this.searchInput.toLowerCase());
      if (!filterRes) {
        this.filteredCards = this.cardList;
        return;
      } else return filterRes;
    });
  }

  filterType() {
    if (this.selectedTypes.length == 0) {
      this.filteredCards = this.cardList;
      return;
    }
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = card.types.find((type => this.selectedTypes.includes(type.toLowerCase())));
      return filterRes;
    });
  }

  filterClass() {
    if (this.selectedClass.length == 0) {
      this.filteredCards = this.cardList;
      return;
    }
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = card.classes.find((className => this.selectedClass.includes(className.toLowerCase())));
      return filterRes;
    });
  }

  filterElement() {
    if (this.selectedElements.length == 0) {
      this.filteredCards = this.cardList;
      return;
    }
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = this.selectedElements.includes(card.element.toLowerCase());
      return filterRes;
    });
  }

  filterCost() {
    if (this.selectedCost.length == 0) {
      this.filteredCards = this.cardList;
      return;
    }
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = this.selectedCost.includes(card.cost_memory?.toString());
      return filterRes;
    });
  }

  filterSpeed() {
    if (this.selectedSpeed.length == 0) {
      this.filteredCards = this.cardList;
      return;
    }
    this.filteredCards = this.cardList.filter((card) => {
      let filterRes = this.selectedSpeed.includes(card.speed);
      return filterRes;
    });
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

  updateMainDeckDisplay(){
      this.mainDeckDisplayCount = this.countDuplicates(this.mainDeck);
      this.mainDeckDisplay = Object.keys(this.mainDeckDisplayCount);
      this.countsMain = Object.values(this.mainDeckDisplayCount);
  }

  updateMatDeckDisplay(){
      this.materialDeckDisplayCount = this.countDuplicates(this.materialDeck);
      this.materialDeckDisplay = Object.keys(this.materialDeckDisplayCount);
      this.countsMaterial = Object.values(this.materialDeckDisplayCount);
  }

  trimCardName(cardName: String) {
    return cardName.replace(/['"]+/g, '');
  }

  cancelCreate() {
    // reset the deck info
    this.isCreatingDeck = false;
    this.mainDeck = [];
    this.materialDeck = [];
    this.countsMain = [];
    this.countsMaterial = [];
    this.mainDeckDisplay = [];
    this.materialDeckDisplay = [];
    this.mainDeckCount = 0;
    this.materialDeckCount = 0;
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

  async saveDeck() {
    this.isCreatingDeck = false;
    let deck: Deck = {
        name: this.deckName,
        main: this.mainDeck,
        material: this.materialDeck
      };
    console.log("Starting deck save: ", deck)
    await db.decks.add(deck);
    console.log("deck saved")
    this.loadDecks();
  }

  removeCard(cardName: string, deck: string){
    if(deck === 'main'){
      let index;
      let foundCard = this.mainDeck.find(card => card.name.toLowerCase() == this.trimCardName(cardName.toLowerCase()));
      if(foundCard){ 
        index = this.mainDeck.indexOf(foundCard, 0);
        this.mainDeck.splice(index, 1);
        this.mainDeckCount--;
        this.mainDeckDisplayCount = this.countDuplicates(this.mainDeck);
        if(foundCard && !this.mainDeckDisplayCount[foundCard.name]) this.mainDeckDisplay = Object.keys(this.mainDeckDisplayCount);
        this.countsMain = Object.values(this.mainDeckDisplayCount);
      }
    } else if (deck === 'material'){
      let foundCard = this.materialDeck.find(card => card.name.toLowerCase() == this.trimCardName(cardName.toLowerCase()));
      this.materialDeck = this.materialDeck.filter(card => card !== foundCard);
      this.materialDeckCount--;
      this.updateMatDeckDisplay();
    }
  }

  openDialog(enterAnimationDuration: string, exitAnimationDuration: string) {
    let dialogRef = this.dialog.open(ModalComponent, {
      width: '400px',
      height: '200px',
      enterAnimationDuration,
      exitAnimationDuration
    });
    dialogRef.afterClosed().subscribe(newDeckName => {
      this.deckName = newDeckName;
      this.saveDeck();
    });
  }
}
