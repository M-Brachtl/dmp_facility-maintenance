import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    appConfig.providers,
    provideAnimations(),
  ]
})
  .catch((err) => console.error(err));

declare const eel: any;
eel.set_host('ws://localhost:8000');
