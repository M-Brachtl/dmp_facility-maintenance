import { Component, Input } from '@angular/core';
import { ModeService } from '../mode.service';

@Component({
  selector: 'app-header-btns',
  imports: [],
  templateUrl: './header-btns.component.html',
  styleUrl: './header-btns.component.scss',
})
export class HeaderBtnsComponent {
  @Input('disposable') disposable: boolean = false;

  mode!: 'list' | 'add' | 'remove';
  constructor(private modeService: ModeService) {}
  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
  }
  switchMode(mode: 'list' | 'add' | 'remove') {
    // emit event modeChanged with mode value
    this.modeService.setMode(mode);
    console.log('Current mode:', this.mode);
  }
}
