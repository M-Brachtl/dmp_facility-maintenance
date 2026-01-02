import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';

@Component({
  selector: 'app-machines',
  imports: [HeaderBtnsComponent],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss'
})
export class MachinesComponent {
  mode!: 'list' | 'add' | 'remove';
  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
  }
  // switchMode(mode: 'list' | 'add' | 'remove') {
  //   // emit event modeChanged with mode value
  //   this.modeService.setMode(mode);
  //   console.log('Current mode:', this.mode);
  // }

}
