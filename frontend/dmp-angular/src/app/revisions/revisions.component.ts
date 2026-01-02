import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';

@Component({
  selector: 'app-revisions',
  imports: [HeaderBtnsComponent],
  templateUrl: './revisions.component.html',
  styleUrl: './revisions.component.scss'
})
export class RevisionsComponent {
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
