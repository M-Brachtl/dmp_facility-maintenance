import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trainings',
  imports: [],
  templateUrl: './trainings.component.html',
  styleUrl: './trainings.component.scss'
})
export class TrainingsComponent {
  constructor(private route: ActivatedRoute) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
  }

}
