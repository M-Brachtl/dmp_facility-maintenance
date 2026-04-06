import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModeService } from './mode.service';
import { DialogContainerComponent } from './dialog-container/dialog-container.component';
// import { trigger, transition, style, query, animate, group } from '@angular/animations';

declare const eel: any;
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, DialogContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
  ]
})

export class AppComponent {
  title = 'Hlavní menu';
  mode!: 'list' | 'add' | 'remove';
  dropdown_changing = false; // to prevent glitching, on when css transition is being carried out
  showDialog = false; // to control the visibility of the dialog container
  dialogContent: string = ''; // to hold the content of the dialog, e.g. the result of export

  constructor(private router: Router, private modeService: ModeService) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('Route changed:', event.url);
        this.title = this.getTitle(event.url);
        this.btnsShown = false; // schová tlačítka při každé změně stránky, aby se nepletla s případným dialogem s výsledkem exportu nebo jiným dialogem, který by mohl být otevřený na nové stránce
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
      case '/revisions/list':
        return 'Záznamy revizí';
      case '/revisions/defects':
        return 'Záznamy revizí se závadami';
      case '/rev-types':
        return 'Typy revizí';
      case '/trainings':
        return 'Záznamy školení';
      case '/employees':
        return 'Zaměstnanci';
      case '/periodicities':
        return 'Periodicity revizí';
      case '/plans':
        return 'Plány revizí a školení';
      default:
        return 'Hlavní menu';
    }
  }

  export() {
    eel.export_csv()((result: any) => {
      console.log('Export result:', result);
      if (result === 'success') {
        // alert('Data byla úspěšně exportována!');
        this.showDialog = true; // zobrazí dialog s informací o úspěšném exportu
        this.dialogContent = 'exportSuccess';
      } else {
        // alert('Export selhal: ' + result);
        this.showDialog = true; // zobrazí dialog s informací o neúspěšném exportu
        this.dialogContent = 'exportFailure';
        console.error('Export failed:', result);
      }
      this.toggleBtns(); // schová tlačítka po exportu, aby se nepletla s případným dialogem s výsledkem exportu
    });
  }

  btnsShown = false;
  toggleBtns() {
    if (!this.dropdown_changing){
      this.btnsShown = !this.btnsShown;
      this.dropdown_changing = true;
    }
  }

  closeDialogCallback() {
    this.showDialog = false;
    this.dialogContent = '';
    this.toggleBtns();
  }
}
// eel
// export const eel = window.eel
// eel.set_host( 'ws://localhost:8000' )
// eel.say_hello_py( 'Javascript World!' )
