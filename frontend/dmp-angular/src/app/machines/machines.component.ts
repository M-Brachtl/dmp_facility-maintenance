import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';
import { SafeHtml } from '@angular/platform-browser';
import { getRevTypes } from '../rev-types/rev-types.component';
import { nextMonthCalendarMachines, allCalendarMachines } from '../plans/plans.component';

import { filterInterface } from '../filterInterface';

declare const eel: any;

@Component({
  selector: 'app-machines',
  imports: [HeaderBtnsComponent, FormsModule, DialogContainerComponent],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss'
})
export class MachinesComponent {
  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild('machineRem') machineRem!: ElementRef;
  @ViewChild('nameChanger') nameChanger!: ElementRef;
  @ViewChild('typeChanger') typeChanger!: ElementRef;
  @ViewChild('locChanger') locChanger!: ElementRef;
  eel_on!: boolean; // bez eel jsou použitá testovací data přímo v kódu
  mode!: 'list' | 'add' | 'remove';
  machinesList: any[] = [];
  typesList: string[] = [];
  locationsList: string[] = [];
  inNumList: string[] = [];
  showDialog: boolean = false;
  dialogContent: SafeHtml = '';
  nextMonthCalendar: { [key: string]: { machines: (Date | string | boolean)[][]; people: (Date | string)[][] } } = {};
  allCalendar: { [key: string]: { machines: (Date | string | boolean)[][]; people: (Date | string)[][] } } = {};
  revTypesList: any[] = [];
  machineDetails: [string, string, string, string, boolean, [string, string][], [string, Date][], number] = ["", "", "", "", false, [], [], 0];
  // machineDetails: [title, inNum, type, location, disposed, nextMonthRevs, allRevisions]
  // debug: nahrazení původních metod a proměnných pro filtraci
  filterI = new filterInterface();

  // filter values
  /*nameFilter: string = '';////
  inNumFilter: string = '';
  typeFilter: string = '';
  locationFilter: string = '';*/

  // filter display control
  // filtersShow: number = 1;////
  // filtersShowHideIcons: string[] = [
  //   'assets/show.svg',
  //   'assets/hide.svg',
  // ]

  // filterHiddenStyleValue: string = ''; ////
  // filterHiddenStyle(): void {
  //   this.filterHiddenStyleValue = this.filtersShow ? 'max-table-h-filter-shown' : 'max-table-h-filter-hidden';
  // }

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  
  async ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
      // this.filterHiddenStyle();
      this.filterI.hiddenStyleUpdate();
    });
    this.modeService.eel_on$.subscribe(eel_on => {
      this.eel_on = eel_on;
    });
    await this.getMachines();
    this.getTypes();
    this.getLocations();
    console.log("Machines List:", this.machinesList);
    console.log("Types List:", this.typesList);
    console.log("Locations List:", this.locationsList);

    // initialize filter style
    this.filterI.filterValues = {
      nameFilter: '',
      inNumFilter: '',
      typeFilter: '',
      locationFilter: '',
      statusFilter: ''
    };
    this.nextMonthCalendar = await nextMonthCalendarMachines(this.eel_on);
    console.log("Next Month Calendar Machines:", this.nextMonthCalendar);
    this.revTypesList = await getRevTypes(this.eel_on);
    this.allCalendar = await allCalendarMachines(this.eel_on);
  }
  
  async getMachines(): Promise<void> {
    if (!this.eel_on) {
      this.machinesList = [ // ID, Inventory Number, Name, Type, Location, Location IDs, ...
        [0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [4], 0, []],
        [1, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [2, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [3, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [5, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [6, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [7, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [8, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [9, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [10, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [11, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [12, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [13, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [14, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [15, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [16, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [17, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
      ];
      this.inNumList = this.machinesList.map(machine => machine[1]);
    } else {
      return new Promise<void>((resolve) => {
        eel.list_machines(true)().then((result: any) => {
          console.log("Výsledek:", result);
          this.machinesList = result;
          this.inNumList = this.machinesList.map(machine => machine[1]);
          resolve();
        });
      });
    }
  }

  getTypes(machinesList: any[] = this.machinesList) {
    const typesSet: Set<string> = new Set();
    machinesList.forEach(machine => {
      typesSet.add(machine[3]);
    });
    this.typesList = Array.from(typesSet);
  }

  getLocations(machinesList: any[] = this.machinesList) {
    const locationsSet: Set<string> = new Set();
    machinesList.forEach(machine => {
      locationsSet.add(machine[4]);
    });
    this.locationsList = Array.from(locationsSet);
  }

  // toggleFilters() {////
  //   this.filtersShow = 1-this.filtersShow;
  //   this.filterHiddenStyle();
  // }

  rowFiltered(machine: any[]): boolean {
    // debug: zatím vytvořím proměnné, abych nemusel nahrazovat, později nahradím
    const nameFilter = this.filterI.filterValues['nameFilter'];
    const inNumFilter = this.filterI.filterValues['inNumFilter'];
    const typeFilter = this.filterI.filterValues['typeFilter'];
    const locationFilter = this.filterI.filterValues['locationFilter'];
    const statusFilter = this.filterI.filterValues['statusFilter'];
    if (nameFilter && !machine[2].toLowerCase().includes(nameFilter.toLowerCase())) {
      return false;
    } else if (inNumFilter && !machine[1].toLowerCase().includes(inNumFilter.toLowerCase())) {
      return false;
    } else if (typeFilter && machine[3] !== typeFilter) {
      return false;
    } else if (locationFilter && machine[4] !== locationFilter) {
      return false;
    } else if (statusFilter) {
      if (statusFilter === 'active' && machine[6]) {
        return false;
      } else if (statusFilter === 'disposed' && !machine[6]) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  isDisposed(machine: any[]): string {
    return machine[6] ? 'line-through text-gray-500' : '';
  }

  onSubmit(event: Event) {
    event.preventDefault();
    const target = event.target as HTMLFormElement;
    const inNum = (target.querySelector('#inNum') as HTMLInputElement).value;
    const name = (target.querySelector('#name') as HTMLInputElement).value;
    const type = (target.querySelector('#type') as HTMLInputElement).value;
    const location = (target.querySelector('#location') as HTMLInputElement).value;
    
    // Validace
    if (!inNum.trim() || !name.trim() || !type || !location) {
      // alert('Prosím vyplňte všechna pole.');
      this.showDialog = true;
      this.dialogContent = "errorMissingFields";
      return;
    }
    if (this.inNumList.includes(inNum)) {
      // alert('Stroj s tímto inventárním číslem již existuje.');
      this.showDialog = true;
      this.dialogContent = "duplicateInNum";
      return;
    }
    if (this.eel_on) {
      eel.add_machine(inNum, name, type, location)().then((result: any) => {
        console.log("Stroj přidán:", result);
        this.getMachines();
      });
    } else {
      const newMachine = [this.machinesList.length, inNum, name, type, location, [], 0, []];
      this.machinesList.push(newMachine);
      this.inNumList.push(inNum);
    }
    // alert('Stroj úspěšně přidán.');
    this.showDialog = true;
    this.dialogContent = "addSuccess";
    
    // promažeme formulář
    Array.from(target.children).forEach(element => {
      if (element instanceof HTMLInputElement) {
        element.value = '';
      }
    });
    return;
  }
  closeDialog() {
    this.showDialog = false;
  }

  removeMachine() {
    const machineId = this.machineRem.nativeElement.value;
    console.log("Likviduji stroj s ID:", machineId);
    // if does not exist, return
    if (!this.machinesList.some(machine => machine[0] == machineId) || machineId === null || machineId === undefined || machineId === '' || machineId === 0) {
      this.showDialog = true;
      this.dialogContent = "errorMachineNotExist";
      return;
    }
    if (this.eel_on) {
      eel.remove_machine(machineId)().then((result: any) => {
        // if (result.status === "error" && result.message === "DependentRevisions") {
        //   this.showDialog = true;
        //   this.dialogContent = "DependentRevisions";
        //   return;
        // }
        if (result.status === "error") {
          this.showDialog = true;
          this.dialogContent = "unknownError";
          return;
        }
        console.log("Stroj likvidován:", result);
        this.getMachines();
      });
    } else {
      // this.machinesList = this.machinesList.filter(machine => machine[0] != machineId);
      // this.inNumList = this.machinesList.map(machine => machine[1]);
      this.machinesList[machineId][6] = 1; // nastavíme jako likvidovaný
    }
    this.showDialog = true;
    this.dialogContent = "removeSuccess";
  }

  selectedMachineName: string = '';
  selectedMachineInNum: string = '';
  selectedMachineType: string = '';
  selectedMachineLocation: string = '';

  // Update selected machine details when the dropdown value changes
  onMachineSelectionChange() {
    const machineId = this.machineRem?.nativeElement.value;
    const machine = this.machinesList.find(machine => machine[0] == machineId);

    if (machine) {
      this.selectedMachineName = machine[2];
      this.selectedMachineInNum = machine[1];
      this.selectedMachineType = machine[3];
      this.selectedMachineLocation = machine[4];
    } else {
      this.selectedMachineName = '';
      this.selectedMachineInNum = '';
      this.selectedMachineType = '';
      this.selectedMachineLocation = '';
    }
  }

  get notDisposedMachines(): any[] {
    return this.machinesList.filter(machine => !machine[6]).slice(1);
  }
  openMachineDetails(machineId: number) {
    const machine = this.machinesList.find(machine => machine[0] === machineId);
    if (machine) {
      const title = machine[2];
      const inNum = machine[1];
      const type = machine[3];
      const location = machine[4];
      const disposed = machine[6] ? true : false;
      const allRevisions = machine[5].map((revId: number) => {
        const revType = this.revTypesList.find(rt => rt[0] === revId);
        const revText = revType ? revType[1] : 'Unknown Revision Type';
        let date: Date = new Date();
        Object.values(this.allCalendar).forEach(entry => {
          entry.machines.forEach(rev => {
            if (rev[2] === inNum && rev[1] === revText) {
              // const revTypeName = 
              if (rev[0] < date){
                date = rev[0] as Date;
              }
            }
          });
        })
        return [revText, date];
      });
      console.log("Next Month Calendar:", this.nextMonthCalendar);
      // Get next month revisions for this machine
      let nextMonthRevs: [string, string][] = [];
      Object.values(this.nextMonthCalendar).forEach(entry => {
        entry.machines.forEach(rev => {
          if (rev[2] === inNum) {
            // const revTypeName = 
            nextMonthRevs.push([rev[1] as string, rev[0] as string]);
          }
        });
      });
      this.machineDetails = [title, inNum, type, location, disposed, nextMonthRevs, allRevisions, machineId];
      this.dialogContent = 'machineDetails';
      this.showDialog = true;
    }
  }
  strDate(dateObj: Date | string): string {
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    return new Intl.DateTimeFormat('cs-CZ', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateObj);
  }
  beforeToday(dateObj: Date | string): string {
    let date: Date;
    if (typeof dateObj === 'string') {
      date = new Date(dateObj);
    } else {
      date = dateObj;
    }
    const today = new Date();
    return date < today ? 'text-red-600 font-bold' : '';
  }
  saveNameChange() {
    const newName = this.nameChanger.nativeElement.value;
    const machineId = this.machineDetails[7];
    if (newName.trim() === '') {
      this.showDialog = true;
      this.dialogContent = "errorMissingFields";
      return;
    }
    if (this.eel_on) {
      eel.edit_machine_name(machineId, newName)().then((result: any) => {
        if (result.status === "error") {
          this.showDialog = true;
          this.dialogContent = "unknownError";
          return;
        }
        console.log("Název stroje aktualizován:", result);
        this.getMachines();
        this.machineDetails[0] = newName; // aktualizujeme název v detailech
      });
    } else {
      const machine = this.machinesList.find(machine => machine[0] === machineId);
      if (machine) {
        machine[2] = newName; // aktualizujeme název v seznamu
        this.machineDetails[0] = newName; // aktualizujeme název v detailech
      }
    }
  }
  saveTypeChange() {
    const newType = this.typeChanger.nativeElement.value;
    const machineId = this.machineDetails[7];
    if (newType.trim() === '') {
      this.showDialog = true;
      this.dialogContent = "errorMissingFields";
      return;
    }
    if (this.eel_on) {
      eel.edit_machine_type(machineId, newType)().then((result: any) => {
        if (result.status === "error") {
          this.showDialog = true;
          this.dialogContent = "unknownError";
          return;
        }
        console.log("Typ stroje aktualizován:", result);
        this.getMachines();
        this.machineDetails[2] = newType; // aktualizujeme název v detailech
      });
    } else {
      const machine = this.machinesList.find(machine => machine[0] === machineId);
      if (machine) {
        machine[3] = newType; // aktualizujeme název v seznamu
        this.machineDetails[2] = newType; // aktualizujeme název v detailech
      }
    }
  }
  saveLocChange() {
    const newLoc = this.locChanger.nativeElement.value;
    const machineId = this.machineDetails[7];
    if (newLoc.trim() === '') {
      this.showDialog = true;
      this.dialogContent = "errorMissingFields";
      return;
    }
    if (this.eel_on) {
      eel.edit_machine_location(machineId, newLoc)().then((result: any) => {
        if (result.status === "error") {
          this.showDialog = true;
          this.dialogContent = "unknownError";
          return;
        }
        console.log("Lokace stroje aktualizována:", result);
        this.getMachines();
        this.machineDetails[3] = newLoc; // aktualizujeme název v detailech
      });
    } else {
      const machine = this.machinesList.find(machine => machine[0] === machineId);
      if (machine) {
        machine[4] = newLoc; // aktualizujeme název v seznamu
        this.machineDetails[3] = newLoc; // aktualizujeme název v detailech
      }
    }
  }
}

export async function getMachines(eel_on: boolean): Promise<[any[], string[]]> {
  let machinesList: any[] = [];
  let inNumList: string[] = [];
  if (!eel_on) {
      machinesList = [ // ID, Inventory Number, Name, Type, Location, Revisions, Deposed, Last Revisions
        [0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [4], 0, []],
        [1, "T_001", "Stroj A", "Test", "Lokace T", [1, 2, 3], 0, []],
        [2, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [3, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [5, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [6, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [7, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [8, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [9, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [10, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [11, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [12, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [13, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [14, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [15, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [16, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [17, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
      ];
      inNumList = machinesList.map(machine => machine[1]);
    } else {
      // eel.list_machines()().then((result: any) => {
      //   console.log("Výsledek:", result);
      //   machinesList = result;
      // });
      return new Promise<[any[], string[]]>((resolve) => {
        eel.list_machines()().then((result: any) => {
          console.log("Výsledek:", result);
          machinesList = result;
          inNumList = machinesList.map(machine => machine[1]);
          resolve([machinesList, inNumList]);
        });
      });
    }
    return [machinesList, inNumList];
}