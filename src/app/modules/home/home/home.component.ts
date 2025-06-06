import { AfterViewInit, ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { RoutingService } from '../../../services/routing/routing.service';
import { Card } from '../../../models/card';
import { CardService } from '../../../services/card-service/card-service.service';
import { CardResponse } from '../../../models/card-response';
import { db } from '../../../services/database/database.service';
import { liveQuery } from 'dexie';
import { forkJoin, mergeMap, Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  cards: Card[] = [];
  imageLinks: string[] = [];
  pageNumber = 1;
  percentLoaded = 0;
  loadedCount = 0;
  loaded = false;
  cardQuery = liveQuery(() => db.card.toArray());

  constructor(public routerService: RoutingService, private cardService: CardService, private changeRef: ChangeDetectorRef) { }

  async ngOnInit() {
    await db.card.count().then(count => {
      if (count == 0) {
        this.getCards(this.pageNumber);
      } else {
        this.loaded = true;
      }
    });
    this.changeRef.detectChanges();
  }

  async addNewCard(card: Card) {
    await db.card.add({
      classes: card.classes,
      cost_memory: card.cost_memory,
      cost_reserve: card.cost_reserve,
      durability: card.durability,
      editions: card.editions,
      effect: card.effect,
      effect_html: card.effect_html,
      effect_raw: card.effect_raw,
      element: card.element,
      flavor: card.flavor,
      image: card.image,
      image_link: card.image_link,
      legality: card.legality,
      level: card.level,
      life: card.life,
      name: card.name,
      power: card.power,
      speed: card.speed,
      subtypes: card.subtypes,
      types: card.types,
      uuid: card.uuid
    });
  }

  getCards(page: number) {
    this.cardService.getCards(page).subscribe((res: CardResponse) => {
      this.percentLoaded = (res.page / res.total_pages) * 100;
      res.data.forEach(card => {
        card.editions.forEach(async (ed) => {
          const result = await this.cardService.getCardImages(ed.image).toPromise();
          card.image = result ? result : {} as Blob;
          card.flavor = ed.flavor;
          this.addNewCard(card);
        });
      }
      );
      if (res.has_more) {
        page++;
        this.getCards(page);
      } else {
        this.loaded = true;
      }
    });
  }

  playAudio() {
    let audio = new Audio();
    audio.src = './assets/button-hover.mp3';
    audio.load();
    audio.play();
  }

  navigateToPage(page: string) {
    this.routerService.navigateToPage(page);
  }
}

