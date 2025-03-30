import {ChangeDetectionStrategy, Component, Inject, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef
} from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  standalone: true,
  imports: [MatButtonModule, MatDialogClose, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {

  public newDeckName = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any){}
  readonly dialogRef = inject(MatDialogRef<ModalComponent>);

  save(){
    this.dialogRef.close(this.newDeckName);
  }
}
