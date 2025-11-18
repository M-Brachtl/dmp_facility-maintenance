import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

declare const eel: any;
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  ngOnInit() {
    eel.get_test()().then((result: string) => {
      console.log("Výsledek:", result);
    });
  }
  title = 'dmp-angular';
}
