import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';
import { SafeHtml } from '@angular/platform-browser';

declare const eel: any;

@Component({
  selector: 'app-machines',
  imports: [HeaderBtnsComponent, FormsModule, DialogContainerComponent],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss'
})
export class MachinesComponent {
  @ViewChild('tableContainer') tableContainer!: ElementRef;

  eel_on: boolean = false; // bez eel jsou použitá testovací data přímo v kódu
  mode!: 'list' | 'add' | 'remove';
  machinesList: any[] = [];
  typesList: string[] = [];
  locationsList: string[] = [];
  inNumList: string[] = [];
  showDialog: boolean = false;
  dialogContent: SafeHtml = '';

  // filter values
  nameFilter: string = '';
  inNumFilter: string = '';
  typeFilter: string = '';
  locationFilter: string = '';

  // filter display control
  filtersShow: number = 1;
  filtersShowHideIcons: string[] = [
    'assets/show.svg',
    'assets/hide.svg',
  ]

  filterHiddenStyleValue: string = '';
  filterHiddenStyle(): void {
    this.filterHiddenStyleValue = this.filtersShow ? 'max-table-h-filter-shown' : 'max-table-h-filter-hidden';
  }

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
      this.filterHiddenStyle();
    });
    this.getMachines();
    this.getTypes();
    this.getLocations();
  }
  
  getMachines() {
    if (!this.eel_on) {
      this.machinesList = [ // ID, Inventory Number, Name, Type, Location, Location IDs, ...
        [0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [4], 0, []],
        [1, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [2, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [3, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [4], 0, []],
        [1, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [2, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [3, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [4], 0, []],
        [1, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [2, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [3, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [0, "FACILITY", "Facility", "Fictive - Facility", "No Location", [4], 0, []],
        [1, "T_001", "Stroj A", "Test", "Lokace T", [1, 2], 0, []],
        [2, "NM-001","New Test Machine vz.1", "Test", "New Testing Facility", [5, 3], 0, []],
        [3, "NM-002","New Test Machine vz.2", "Test - A2", "Location - A2", [6], 0, []],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
        [4, "OLD-01","Old Machine", "Test", "No Location", [4], 1, [0,1,2,3]],
      ];
    } else {
      eel.list_machines()().then((result: any) => {
        console.log("Výsledek:", result);
        this.machinesList = result;
      });
    }
    this.inNumList = this.machinesList.map(machine => machine[1]);
  }

  getTypes() {
    if (!this.eel_on) {
      this.typesList = ["Fictive - Facility", "Test", "Test - A2", "Non-present Test"];
    } else {
      eel.list_types()().then((result: any) => {
        console.log("Výsledek:", result);
        this.typesList = result;
      });
    }
  }

  getLocations() {
    if (!this.eel_on) {
      this.locationsList = ["Lokace T", "New Testing Facility", "No Location", "Non-present Location", "Location - A2"];
    } else {
      eel.list_locations()().then((result: any) => {
        console.log("Výsledek:", result);
        this.locationsList = result;
      });
    }
  }

  toggleFilters() {
    this.filtersShow = 1-this.filtersShow;
    this.filterHiddenStyle();
  }

  rowFiltered(machine: any[]): boolean {
    if (this.nameFilter && !machine[2].toLowerCase().includes(this.nameFilter.toLowerCase())) {
      return false;
    } else if (this.inNumFilter && !machine[1].toLowerCase().includes(this.inNumFilter.toLowerCase())) {
      return false;
    } else if (this.typeFilter && machine[3] !== this.typeFilter) {
      return false;
    } else if (this.locationFilter && machine[4] !== this.locationFilter) {
      return false;
    } else {
      return true;
    }
  }

  deleteFilters() {
    this.nameFilter = '';
    this.inNumFilter = '';
    this.typeFilter = '';
    this.locationFilter = '';
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
    if (!inNum || !name || !type || !location) {
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
}
