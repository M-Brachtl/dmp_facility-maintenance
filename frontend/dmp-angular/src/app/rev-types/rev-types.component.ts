import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-rev-types',
  imports: [],
  templateUrl: './rev-types.component.html',
  styleUrl: './rev-types.component.scss'
})
export class RevTypesComponent {
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
  }

}
