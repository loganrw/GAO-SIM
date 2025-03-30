import { Component, OnInit } from '@angular/core';
import { Card } from '../../../models/card';
import { liveQuery } from 'dexie';
import { db } from '../../../services/database/database.service';
import { FormControl } from '@angular/forms';

interface CardCount {
  [key: string]: number
}

interface CardDisplay {
  name: string,
  count: number
}

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrl: './decks.component.scss'
})
export class DecksComponent implements OnInit {

  loaded = false;
  cardQuery = liveQuery(() => db.card.toArray());
  cardList: Card[] = [];
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
  // Track card elements to make sure the player only uses elements for their champion
  activeCardElements: string[] = [];

  ngOnInit(): void {
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
      this.materialDeckDisplayCount = this.countDuplicates(this.materialDeck);
      this.materialDeckDisplay = Object.keys(this.materialDeckDisplayCount);
      this.countsMaterial = Object.values(this.materialDeckDisplayCount);
    } else if (!card.types.includes("CHAMPION") && !card.types.includes("REGALIA") && this.activeCardElements.includes(card.element || "NORM")) {
      if (!this.mainDeckDisplayCount[JSON.stringify(card.name)] || this.mainDeckDisplayCount[JSON.stringify(card.name)] < 4) {
        this.mainDeck.push(card);
        this.mainDeckCount++;
      }
      this.mainDeckDisplayCount = this.countDuplicates(this.mainDeck);
      this.mainDeckDisplay = Object.keys(this.mainDeckDisplayCount);
      this.countsMain = Object.values(this.mainDeckDisplayCount);
    }
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

  saveDeck() {

  }
}
