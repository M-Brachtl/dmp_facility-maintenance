import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';

@Component({
  selector: 'app-header-btns',
  imports: [],
  templateUrl: './header-btns.component.html',
  styleUrl: './header-btns.component.scss',
})
export class HeaderBtnsComponent {
  @Input('altText') alternativeText: string[] = ["Přidat", "Odebrat", "Vypsat"];

  mode!: 'list' | 'add' | 'remove';
  constructor(private modeService: ModeService, private route: ActivatedRoute, private router: Router) {}
  ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
  }
  switchMode(mode: 'list' | 'add' | 'remove') {
    // emit event modeChanged with mode value
    this.modeService.setMode(mode);
    this.route.url.subscribe(url => {
      if (url.toString().includes('revisions')) {
        console.log('Current route:', url);
        if (mode === 'list') {
          this.router.navigate(['/revisions', 'list']);
        } else {
          this.router.navigate(['/revisions']);
        }
      }
    });
  }
}
