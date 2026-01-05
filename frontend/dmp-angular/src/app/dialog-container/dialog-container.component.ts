import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dialog-container',
  imports: [],
  templateUrl: './dialog-container.component.html',
  styleUrl: './dialog-container.component.scss',
})
export class DialogContainerComponent {
  @Output("closeDialog") closeDialog = new EventEmitter<void>();
  close() {
    // Logic to close the dialog
    this.closeDialog.emit();
  }
}
