import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';
import { getEmployees } from '../employees/employees.component';
import { getTLogs } from '../trainings/trainings.component';
import { getMachines } from '../machines/machines.component';

import { filterInterface } from '../filterInterface';

declare const eel: any;

@Component({
  selector: 'app-rev-types',
  imports: [HeaderBtnsComponent, FormsModule, DialogContainerComponent],
  templateUrl: './rev-types.component.html',
  styleUrl: './rev-types.component.scss'
})
export class RevTypesComponent {
  @ViewChild('revTypeRem') revTypeRem!: ElementRef;

  mode!: 'list' | 'add' | 'remove';
  revTypesList: any[] = [];
  facilityRevTypesList: any[] = [];
  // filtersShow: number = 1;
  filterI = new filterInterface();
  eel_on!: boolean; // bez eel jsou použitá testovací data přímo v kódu
  showDialog: boolean = false;
  dialogContent: string = '';
  form_training_length: number = 0;
  trainedEmployees: [string, string[]] = ["" , []];
  TLogs: any[] = [];
  employeesList: any[] = [];
  dependentMachines: [string, string[][]] = ["", []];
  machineList: any[][] = [];

  detailedBtnsShow: number = 1;

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
      this.getRevTypes();
    });
    this.getRevTypes();
    this.filterI.hiddenStyleUpdate();
    this.filterI.filterValues['typeFilter'] = 'all';
    this.filterI.filterValues['nameFilter'] = '';
    this.employeesList = await getEmployees(this.eel_on);
    this.TLogs = await getTLogs(this.eel_on);
    this.machineList = await getMachines(this.eel_on);
  }
  getRevTypes() {
    if (this.eel_on) {
      eel.list_revision_types()().then((result: any) => {
        console.log("Výsledek:", result);
        this.revTypesList = result;
      });
      return;
    } else {
      this.revTypesList = [
        [1, 'Revize T1', 12, 0],
        [2, 'Revize T2', 24, 0],
        [3, 'Revize T3-P', 48, 0],
        [4, 'Revize F1-Test', 6, 1],
        [5, 'Revize New_test 1', 60, 0]
      ];
    }
    this.facilityRevTypesList = this.revTypesList.filter(rt => rt[3] == 1);
  }

  rowFiltered(revType: any): boolean { // vrací true, pokud řádek vyhovuje filtrům
    const nameFilter = this.filterI.filterValues['nameFilter'] || '';
    const typeFilter = this.filterI.filterValues['typeFilter'] || 'all';
    if (nameFilter && !revType[1].toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    } else if (typeFilter === 'is' && revType[3] != 1) {
      return false;
    } else if (typeFilter === 'is not' && revType[3] != 0) {
      return false;
    }
    return true;
  }

  isFacility(revType: any): string {
    return revType[3] == 1 ? 'text-indigo-700 font-bold' : '';
  }

  toggleDetailedButtons() {
    this.detailedBtnsShow = 1 - this.detailedBtnsShow;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const name = (target.querySelector('#name') as HTMLInputElement).value;
    const facility = (target.querySelector('#facility') as HTMLInputElement).checked;
    // const this.form_training_length = this.form_training_length;
    
    // Validace
    if (!name.trim()) {
      // alert('Prosím vyplňte všechna pole.');
      this.showDialog = true;
      this.dialogContent = "errorMissingFields";
      return;
    }
    if (isNaN(Number(this.form_training_length)) || Number(this.form_training_length) <= 0 || !Number.isInteger(Number(this.form_training_length))) {
      this.showDialog = true;
      this.dialogContent = "errorInvalidTrainingLength";
      console.log("Invalid training length:", this.form_training_length);
      console.log("Type of training length:", typeof this.form_training_length);
      return;
    }
    if (this.eel_on) {
      eel.add_revision_type(name, this.form_training_length, facility)().then((result: any) => {
        console.log("Revize přidána:", result);
        this.getRevTypes();
      });
    } else {
      const newRevType = [this.revTypesList.length, name, this.form_training_length, facility ? 1 : 0];
      this.revTypesList.push(newRevType);
    }
    // alert('Stroj úspěšně přidán.');
    this.showDialog = true;
    this.dialogContent = "addSuccess";
    this.getRevTypes();
    // promažeme formulář
    console.log(target.children);
    Array.from(target.children).forEach(element => {
      if (element instanceof HTMLInputElement) {
        element.value = '';
      } else if (element instanceof HTMLDivElement) {
        const checkbox = element.querySelector('#facility') as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    });
    this.form_training_length = 0;
    return;
  }

  removeRevType() {
    const revTypeId = this.revTypeRem.nativeElement.value;
    if (!revTypeId) {
      this.showDialog = true;
      this.dialogContent = "errorNoSelection";
      return;
    }
    console.log("Odebírám typ revize s ID:", revTypeId);
    // if does not exist, return
    if (!this.revTypesList.some(revType => revType[0] == revTypeId) || revTypeId === null || revTypeId === undefined || revTypeId === '' || revTypeId === 0) {
      this.showDialog = true;
      this.dialogContent = "errorRevTypeNotExist";
      return;
    }
    if (this.eel_on) {
      eel.remove_revision_type(revTypeId)().then((result: any) => {
        if (result.status === "error" && result.message === "DependentMachines") {
          this.showDialog = true;
          this.dialogContent = "errorDependentMachines";
          return;
        }
        this.getRevTypes();
      });
    } else {
      this.revTypesList = this.revTypesList.filter(revType => revType[0] != revTypeId);
    }
  }
  listValidTrainings(employeeID: number): string[] {
    if (!this.TLogs || this.TLogs.length === 0) {
      return [];
    }
    const emplLogs = this.TLogs.filter(log => log[2] === employeeID);
    let validTrainings: Set<string> = new Set();
    emplLogs.forEach(log => {
      if (log[4] >= new Date()){
        validTrainings.add(this.employeesList.find(emp => emp[0] === log[2])[1]);
      }
    })
    return Array.from(validTrainings);
  }
  openTrainedEmployees(revTypeID: number) {
    this.trainedEmployees = [this.revTypesList.find(rt => rt[0] === revTypeID)[1], this.listValidTrainings(revTypeID)];
    this.dialogContent = 'trainedEmployees';
    this.showDialog = true;
  }
  listDependentMachines(revTypeID: number): string[][] {
    if (!this.machineList || this.machineList.length === 0) {
      return [];
    }
    console.log("Stroje:", this.machineList);
    const dependentMachines = this.machineList[0].filter(machine => machine[5].includes(revTypeID)).map(machine => [machine[2], this.machineList[1][machine[0]]]);
    return dependentMachines;
  }
  openDependentMachines(revTypeID: number) {
    this.dependentMachines = [this.revTypesList.find(rt => rt[0] === revTypeID)[1], this.listDependentMachines(revTypeID)];
    this.dialogContent = 'dependentMachines';
    this.showDialog = true;
  }
}

export async function getRevTypes(eel_on: boolean): Promise<any[]> {
  let revTypesList: any[] = [];
  if (eel_on) {
      // eel.list_revision_types()().then((result: any) => {
      //   console.log("Výsledek:", result);
      //   revTypesList = result;
      // });
      // return revTypesList;
      return new Promise<any[]>((resolve) => {
        eel.list_revision_types()().then((result: any) => {
        console.log("Výsledek:", result);
        revTypesList = result;
        resolve(revTypesList);
        });
      });
    } else {
      revTypesList = [
        [1, 'Revize T1', 12, 0],
        [2, 'Revize T2', 24, 0],
        [3, 'Revize T3-P', 48, 0],
        [4, 'Revize F1-Test', 6, 1],
        [5, 'Revize New_test 1', 60, 0]
      ];
    }
    // this.facilityRevTypesList = revTypesList.filter(rt => rt[3] == 1);
    return revTypesList;
}