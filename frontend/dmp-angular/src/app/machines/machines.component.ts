import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';

declare const eel: any;

@Component({
  selector: 'app-machines',
  imports: [HeaderBtnsComponent, FormsModule],
  templateUrl: './machines.component.html',
  styleUrl: './machines.component.scss'
})
export class MachinesComponent {

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  isOverflowing(): boolean {
    const el = this.tableContainer.nativeElement;
    return el.scrollHeight > el.clientHeight+20; // pro miniaturní scrollovací lištu
  }

  eel_on: boolean = false;
  mode!: 'list' | 'add' | 'remove';
  machinesList: any[] = [];
  typesList: string[] = [];
  locationsList: string[] = [];

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
  get filterHiddenStyle(): string {
    let isOverflowing = false;
    try {
      isOverflowing = this.isOverflowing();
    } catch (error) {
      isOverflowing = false;
    };
    const shownOption = isOverflowing ? 'max-table-h-filter-shown overflowing' : 'max-table-h-filter-shown nonoverflowing';
    return this.filtersShow ? shownOption : 'max-table-h-filter-hidden';
  }

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
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
      ];
    } else {
      eel.list_machines()().then((result: any) => {
        console.log("Výsledek:", result);
        this.machinesList = result;
      });
    }
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
}
