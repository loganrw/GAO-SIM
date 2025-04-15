import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../models/card';

@Component({
  selector: 'app-card-display',
  templateUrl: './card-display.component.html'
})
export class CardDisplayComponent implements OnInit {
  @Input() cardData!: Card;
  @Input() altImage: Blob;
  imageSrc = ''

  ngOnInit(): void {
    if (this.altImage) {
      this.imageSrc = this.getCardURL(this.altImage);
    }
    else if (this.cardData.image) {
      this.imageSrc = this.getCardURL(this.cardData.image);
    }
  }


  getCardURL(blob: Blob) {
    return URL.createObjectURL(blob);
  }
}
