import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

import { filterInterface } from '../filterInterface';

declare const eel: any;

@Component({
  selector: 'app-periodicities',
  imports: [HeaderBtnsComponent, FormsModule, DialogContainerComponent],
  templateUrl: './periodicities.component.html',
  styleUrl: './periodicities.component.scss',
})
export class PeriodicitiesComponent {
@ViewChild('revTypeAdd') revTypeAddRef!: ElementRef;
  @ViewChild('machineAdd') machineAddRef!: ElementRef;
  @ViewChild('periodRem') periodRemRef!: ElementRef;

  mode!: 'list' | 'add' | 'remove';
  filterI = new filterInterface();
  revTypesList: any[] = [];
  eel_on!: boolean; // bez eel jsou použitá testovací data přímo v kódu
  showDialog: boolean = false;
  dialogContent: string = '';
  machinesList: any[] = [];
  inNumList: string[] = [];
  facilityRevTypesList: any[] = [];
  periodicities: any[] = [];
  toggleMachineColText: number = 0;
  form_period_length: number = 0;

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
      this.filterI.hiddenStyleUpdate();
    });
    this.modeService.eel_on$.subscribe(eel_status => {
      this.eel_on = eel_status;
    });
    this.getMachines();
    this.getRevTypes();
    this.getPeriodicities();

    this.filterI.filterValues = {
      machineName: '',
      machineInNum: '',
      revType: '',
      minPeriod: '',
      maxPeriod: ''
    }
  }
  
  // cross table getters
  periodGet = {
    revType: (periodicity: any[]): string => {
      return this.revTypesList[periodicity[1]-1]
    },
    machine: (periodicity: any[]): string => {
      return this.machinesList[periodicity[2]]
    }
  };



  getMachines() {
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
    } else {
      eel.list_machines()().then((result: any) => {
        console.log("Výsledek:", result);
        this.machinesList = result;
      });
    }
    this.inNumList = this.machinesList.map(machine => machine[1]);
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

  getPeriodicities() {
    if (!this.eel_on){
      this.periodicities = [
        [1, 1, 1, 12],
        [2, 2, 1, 24],
        [3, 5, 2, 6],
        [4, 3, 2, 60],
        [5, 4, 0, 18],];
      return;
    } else {
      eel.list_periodicity()().then((result: any) => {
        console.log("Výsledek:", result);
        this.periodicities = result;
      });
    }
  }

  rowFiltered(entry: any[]){ // ID, revtypeName, machineName, machineInNum, periodicityMonths
    const revTypeName = this.periodGet.revType(entry)[1];
    const machineName = this.periodGet.machine(entry)[2];
    const machineInNum = this.periodGet.machine(entry)[1];
    const periodicityMonths = entry[3];
    
    /* this.filterI.filterValues = {
      machineName: '',
      machineInNum: '',
      revType: '',
      minPeriod: '',
      maxPeriod: ''
    }*/

    if (
      (revTypeName && !revTypeName.toLowerCase().includes(this.filterI.filterValues['revType'].toLowerCase())) ||
      (machineName && !machineName.toLowerCase().includes(this.filterI.filterValues['machineName'].toLowerCase())) ||
      (machineInNum && !machineInNum.toLowerCase().includes(this.filterI.filterValues['machineInNum'].toLowerCase()) )||
      (this.filterI.filterValues['minPeriod'] && periodicityMonths < parseInt(this.filterI.filterValues['minPeriod'])) ||
      (this.filterI.filterValues['maxPeriod'] && periodicityMonths > parseInt(this.filterI.filterValues['maxPeriod']))
    ) {
      return false;
    } else {
      return true;
    }
  }

  isFacility(revTypeID: number){
    return '';
  }

  async onSubmit(event: any) {
    event.preventDefault();
    const revTypeID = this.revTypeAddRef.nativeElement.value;
    const machineID = this.machineAddRef.nativeElement.value;
    
    if (!revTypeID || !machineID || !this.form_period_length) {
      this.dialogContent = 'errorMissingFields';
      this.showDialog = true;
      return;
    } else if (this.form_period_length <= 0) {
      this.dialogContent = 'errorInvalidPeriod';
      this.showDialog = true;
      return;
    }
    let existingPeriodicity = null;
    if (this.eel_on) {
      const existing = await eel.get_periodicity(parseInt(machineID), parseInt(revTypeID))();
      if (existing != null) {
        this.dialogContent = 'errorPeriodicityExists';
        this.showDialog = true;
        existingPeriodicity = true;
      }
      if (existingPeriodicity) {
        return;
      } else {
        eel.add_periodicity(parseInt(machineID), parseInt(revTypeID), this.form_period_length)().then((result: any) => {
          console.log("Výsledek přidání periodicity:", result);
          if (result === "success") {
            this.dialogContent = 'successAddPeriodicity';
            this.showDialog = true;
            this.getPeriodicities();
          } else {
            this.dialogContent = 'errorAddPeriodicity';
            this.showDialog = true;
            return;
          }
        });
      }
    } else {
      const newID = this.periodicities.length + 1;
      this.periodicities.push([newID, parseInt(revTypeID), parseInt(machineID), this.form_period_length]);
      this.dialogContent = 'addSuccess';
      this.showDialog = true;
    }

    this.revTypeAddRef.nativeElement.value = '';
    this.machineAddRef.nativeElement.value = '';
    this.form_period_length = 0;
  }
  removePeriodicity() {
    const periodicityID = parseInt(this.periodRemRef.nativeElement.value);
    const machineID = this.periodicities.find(p => p[0] === periodicityID)?.[2];
    const revTypeID = this.periodicities.find(p => p[0] === periodicityID)?.[1];
    if (!periodicityID) {
      this.dialogContent = 'errorMissingFields';
      this.showDialog = true;
      return;
    }
    if (this.eel_on) {
      eel.remove_periodicity(machineID, revTypeID)().then((result: any) => { // machineID, revTypeID
        console.log("Výsledek odstranění periodicity:", result);
        if (result === "success") {
          this.dialogContent = 'removeSuccess';
          this.showDialog = true;
          this.getPeriodicities();
        } else {
          this.dialogContent = 'errorRemovePeriodicity';
          this.showDialog = true;
          return;
        }
      });
    } else {
      this.periodicities = this.periodicities.filter(p => p[0] !== periodicityID);
      this.dialogContent = 'removeSuccess';
      this.showDialog = true;
    }
  }
  get activeMachinesList() {
    return this.machinesList.filter(machine => !machine[6]);
  }
}

// export async function getPeriodicities(eel_on: boolean): any[] {
//   if (!eel_on) {
//     return [
//       [1, 1, 1, 12],
//       [2, 2, 1, 24],
//       [3, 5, 2, 6],
//       [4, 3, 2, 60],
//       [5, 4, 0, 18],];
//   } else {
//     const result = await eel.list_periodicity()();
//     return result;
//   }