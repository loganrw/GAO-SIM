import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-popup-modal',
  templateUrl: './popup-modal.component.html',
  styleUrl: './popup-modal.component.scss'
})
export class PopupModalComponent {

  @Input() message: string;
  @Input() opened: boolean;
  @Output() openEvent = new EventEmitter<boolean>();

  toggleModal() {
    this.opened = !this.opened;
    if (!this.opened) this.openEvent.emit(false);
  }
}
