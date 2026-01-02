import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';

@Component({
  selector: 'app-rev-types',
  imports: [HeaderBtnsComponent],
  templateUrl: './rev-types.component.html',
  styleUrl: './rev-types.component.scss'
})
export class RevTypesComponent {
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

}
