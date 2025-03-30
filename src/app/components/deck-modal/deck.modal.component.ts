import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef
} from '@angular/material/dialog';
import { Deck } from '../../models/deck';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './deck.modal.component.html',
  standalone: true,
  imports: [MatButtonModule, MatDialogClose, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeckModalComponent {

  public newDeckName = '';
  isValid = true;
  isEmpty = false;
  deckNames: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public deckList: Deck[]) {
    this.deckList.forEach(deck => {
      this.deckNames.push(deck.name);
    });
  }
  readonly dialogRef = inject(MatDialogRef<DeckModalComponent>);

  validateName(event: any) {
    const inputValue = (event.target as HTMLInputElement).value;
    inputValue === '' ? this.isEmpty = true : this.isEmpty = false;
    this.deckNames.includes(inputValue) ? this.isValid = false : this.isValid = true;
  }

  save() {
    this.dialogRef.close(this.newDeckName);
  }
}
