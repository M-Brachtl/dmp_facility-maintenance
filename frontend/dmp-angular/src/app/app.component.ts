import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModeService } from './mode.service';
// import { trigger, transition, style, query, animate, group } from '@angular/animations';

declare const eel: any;
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
  ]
})

export class AppComponent {
  title = 'Hlavní menu';
  mode!: 'list' | 'add' | 'remove';

  constructor(private router: Router, private modeService: ModeService) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Route changed:', event.url);
        this.title = this.getTitle(event.url);
      });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
  }
  getTitle(url: string): string {
    switch (url) {
      case '/machines':
        return 'Správa strojů';
      case '/revisions':
        return 'Záznamy revizí';
      case '/rev-types':
        return 'Typy revizí';
      case '/trainings':
        return 'Záznamy školení';
      case '/employees':
        return 'Zaměstnanci';
      case '/rev-machine':
        return 'Periodicity revizí';
      default:
        return 'Hlavní menu';
    }
  }
}

// eel
// export const eel = window.eel
// eel.set_host( 'ws://localhost:8000' )
// eel.say_hello_py( 'Javascript World!' )
