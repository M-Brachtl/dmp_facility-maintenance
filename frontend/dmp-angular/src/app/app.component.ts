import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
// import { trigger, transition, style, query, animate, group } from '@angular/animations';

declare const eel: any;
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
  ]
})

export class AppComponent {
  title = 'Hlavní menu';
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Route changed:', event.url);
        this.title = this.getTitle(event.url);
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
        return 'Školení';
      default:
        return 'Hlavní menu';
    }
  }
}
