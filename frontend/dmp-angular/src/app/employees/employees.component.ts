import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

import { filterInterface } from '../filterInterface';

declare const eel: any;

@Component({
  selector: 'app-employees',
  imports: [HeaderBtnsComponent, FormsModule, DialogContainerComponent],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
})
export class EmployeesComponent {
  @ViewChild('employeeRem') employeeRem!: ElementRef;
  mode!: 'list' | 'add' | 'remove';
  filterI = new filterInterface();
  employeesList: any[] = [];
  eel_on: boolean = false; // bez eel jsou použitá testovací data přímo v kódu
  showDialog: boolean = false;
  dialogContent: string = '';

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
    this.getEmployees();
    this.filterI.hiddenStyleUpdate();
    this.filterI.filterValues['nameFilter'] = '';
  }

  getEmployees() {
    if (this.eel_on) {
      eel.list_employees()().then((result: any) => {
        console.log("Výsledek:", result);
        this.employeesList = result;
      });
      return;
    } else {
      this.employeesList = [
        [1, 'Adam Testovač'],
        [2, 'Matyk Testovač-C2'],
        [3, 'Jana Příkladová'],
        [4, 'Petr Ukázkový'],
        [5, 'Eva Demoová']
      ];
    }
  }
  removeEmployee() {
    if (!this.employeeRem.nativeElement.value) {
      this.showDialog = true;
      this.dialogContent = 'errorNoSelection';
      return;
    } else if (!this.employeesList.find(emp => emp[0] == this.employeeRem.nativeElement.value)) {
      this.showDialog = true;
      this.dialogContent = 'errorEmployeeNotExist';
      return;
    }
    if (this.eel_on) {
      const empID = this.employeeRem.nativeElement.value;
      eel.remove_employee(empID)().then((result: any) => {
        console.log("Výsledek odebrání zaměstnance:", result);
        this.showDialog = true;
        this.dialogContent = 'removeSuccess';
        this.dialogContent = `Zaměstnanec s ID ${empID} byl úspěšně odebrán.`;
        this.getEmployees();
      });
    } else {
      const empID = this.employeeRem.nativeElement.value;
      this.employeesList = this.employeesList.filter(emp => emp[0] != empID);
      this.showDialog = true;
      this.dialogContent = 'removeSuccess';
      this.dialogContent = `Zaměstnanec s ID ${empID} byl úspěšně odebrán.`;
    }
  }
  rowFiltered(employee: any): boolean {
    if (this.filterI.filterValues['nameFilter'] && !employee[1].toLowerCase().includes(this.filterI.filterValues['nameFilter'].toLowerCase())) {
      return false;
    } else {
      return true;
    }
  }
  onSubmit(event: Event) {
    event.preventDefault();
    const empName = ((event.target as HTMLFormElement)!.querySelector('#name') as HTMLInputElement)!.value;
    if (/*!RegExp('^\\p{L}+ \\p{L}+$').test(empName)*/!empName.trim()) {
      this.showDialog = true;
      this.dialogContent = 'errorMissingFields';
      // console.log("Neplatné jméno zaměstnance:", empName);
      return;
    }
    if (this.eel_on) {
      eel.add_employee(empName)().then((result: any) => {
        console.log("Výsledek přidání zaměstnance:", result);
        this.showDialog = true;
        this.dialogContent = 'addSuccess';
        this.getEmployees();
      });
    } else {
      const newEmpID = this.employeesList.length ? Math.max(...this.employeesList.map(emp => emp[0])) + 1 : 1;
      this.employeesList.push([newEmpID, empName]);
      this.showDialog = true;
      this.dialogContent = 'addSuccess';
    }
  }
}
