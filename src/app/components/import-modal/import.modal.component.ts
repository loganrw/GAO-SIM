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
  templateUrl: './import.modal.component.html',
  standalone: true,
  imports: [MatButtonModule, MatDialogClose, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportModalComponent {

  public deckList = '';

  readonly dialogRef = inject(MatDialogRef<ImportModalComponent>);

  save() {
    this.dialogRef.close(this.deckList);
  }
}
