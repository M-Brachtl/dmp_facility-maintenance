import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-revisions',
  imports: [],
  templateUrl: './revisions.component.html',
  styleUrl: './revisions.component.scss'
})
export class RevisionsComponent {
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
  }

}
