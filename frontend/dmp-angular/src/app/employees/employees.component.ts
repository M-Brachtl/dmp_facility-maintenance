import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

import { filterInterface } from '../filterInterface';
import { getTLogs } from '../trainings/trainings.component';
import { getRevTypes } from '../rev-types/rev-types.component';

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
  eel_on!: boolean; // bez eel jsou použitá testovací data přímo v kódu
  showDialog: boolean = false;
  dialogContent: string = '';
  TLogs: any[] = [];
  revTypes: any[] = [];
  employeeTrainings: [string, string[]] = ["", []];

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  async ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
    this.modeService.eel_on$.subscribe(eel_on => {
      this.eel_on = eel_on;
    });
    this.TLogs = await getTLogs(this.eel_on);
    this.revTypes = await getRevTypes(this.eel_on);
    this.getEmployees();
    this.filterI.hiddenStyleUpdate();
    this.filterI.filterValues['nameFilter'] = '';
    this.filterI.filterValues['activeFilter'] = 'active'; // all/active/inactive
  }

  getEmployees() {
    if (this.eel_on) {
      eel.list_people(true)().then((result: any) => {
        console.log("Výsledek:", result);
        this.employeesList = result;
      });
      return;
    } else {
      this.employeesList = [
        [1, 'Adam Testovač', 1],
        [2, 'Matyk Testovač-C2', 1],
        [3, 'Jana Příkladová', 1],
        [4, 'Petr Ukázkový', 1],
        [5, 'Eva Demoová', 1],
        [6, 'Jára Cimrman', 0],
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
      eel.remove_people(empID)().then((result: any) => {
        if (result.error) {
          this.showDialog = true;
          this.dialogContent = 'serverError';
          return;
        }
        this.showDialog = true;
        this.dialogContent = 'removeSuccess';
        this.getEmployees();
      });
    } else {
      const empID = this.employeeRem.nativeElement.value;
      this.employeesList = this.employeesList.map(emp => {
        if (emp[0] == empID) {
          emp[2] = 0; // nastavení na neaktivní
        }
        return emp;
      });
      this.showDialog = true;
      this.dialogContent = 'removeSuccess';
    }
  }
  rowFiltered(employee: any): boolean {
    if (this.filterI.filterValues['activeFilter'] === '') {
      this.filterI.filterValues['activeFilter'] = 'active';
    }
    if (this.filterI.filterValues['nameFilter'] && !employee[1].toLowerCase().includes(this.filterI.filterValues['nameFilter'].toLowerCase())) {
      return false;
    } else if (this.filterI.filterValues['activeFilter'] === 'active' && employee[2] == 0) {
      return false;
    } else if (this.filterI.filterValues['activeFilter'] === 'inactive' && employee[2] == 1) {
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
      eel.add_people(empName)().then((result: any) => {
        console.log("Výsledek přidání zaměstnance:", result);
        this.showDialog = true;
        this.dialogContent = 'addSuccess';
        this.getEmployees();
      });
    } else {
      const newEmpID = this.employeesList.length ? Math.max(...this.employeesList.map(emp => emp[0])) + 1 : 1;
      this.employeesList.push([newEmpID, empName, 1]);
      this.showDialog = true;
      this.dialogContent = 'addSuccess';
    }
  }
  isActive(employee: any[]): string {
    return employee[2] ? '' : 'line-through text-gray-500';
  }
  get activeEmployees() {
    return this.employeesList.filter(emp => emp[2] === 1);
  }

  listValidTrainings(employeeID: number): string[] {
    if (!this.TLogs || this.TLogs.length === 0) {
      return [];
    }
    const emplLogs = this.TLogs.filter(log => log[2] === employeeID);
    let validTrainings: Set<string> = new Set();
    emplLogs.forEach(log => {
      if (log[4] >= new Date()){
        validTrainings.add(this.revTypes.find(rt => rt[0] === log[1])[1]);
      }
    })
    return Array.from(validTrainings);
  }

  openEmployeeTrainings(employeeID: number) {
    this.employeeTrainings = [this.employeesList.find(emp => emp[0] === employeeID)[1], this.listValidTrainings(employeeID)];
    this.dialogContent = 'employeeTrainings';
    this.showDialog = true;
  }
}

export async function getEmployees(eel_on: boolean = true, include_inactive: boolean = true): Promise<any[]> {
  let employeesList: any[] = [];
  if (eel_on) {
    // eel.list_people()().then((result: any) => {
    //   employeesList = result;
    //   console.log("Výsledek empl2:", employeesList);
    //   return employeesList;
    // });
    return new Promise<any[]>((resolve) => {
      eel.list_people(include_inactive)().then((result: any) => {
        employeesList = result;
        console.log("Výsledek empl2:", employeesList);
        resolve(employeesList);
      });
    });
  } else {
    employeesList = [
      [1, 'Adam Testovač', 1],
      [2, 'Matyk Testovač-C2', 1],
      [3, 'Jana Příkladová', 1],
      [4, 'Petr Ukázkový', 1],
      [5, 'Eva Demoová', 1],
      [6, 'Jára Cimrman', 0],
    ];
    return employeesList;
  }
}