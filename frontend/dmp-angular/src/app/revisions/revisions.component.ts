import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

import { filterInterface } from '../filterInterface';
import { getEmployees } from '../employees/employees.component';

declare const eel: any;
// Periodicita
@Component({
  selector: 'app-revisions',
  imports: [HeaderBtnsComponent, DialogContainerComponent, FormsModule],
  templateUrl: './revisions.component.html',
  styleUrl: './revisions.component.scss'
})
export class RevisionsComponent {
  @ViewChild('revTypeAdd') revTypeAddRef!: ElementRef;
  @ViewChild('machineAdd') machineAddRef!: ElementRef;
  @ViewChild('employeeAdd') employeeAddRef!: ElementRef;
  // @ViewChild('employeeRem') employeeRemRef!: ElementRef;
  @ViewChild('dateAdd') dateAddRef!: ElementRef;
  @ViewChild('resultAdd') resultAddRef!: ElementRef;
  @ViewChild('notesAdd') notesAddRef!: ElementRef;
  @ViewChild('logRem') logRemRef!: ElementRef;
  
  // @ViewChild('revTypeRem') revTypeRemRef!: ElementRef;
  // @ViewChild('machineRem') machineRemRef!: ElementRef;
  revTypeRem = '';
  machineRem = '';

  mode!: 'list' | 'add' | 'remove';
  filterI = new filterInterface();
  revTypesList: any[] = [];
  eel_on: boolean = false; // bez eel jsou použitá testovací data přímo v kódu
  showDialog: boolean = false;
  dialogContent: string = '';
  machinesList: any[] = [];
  inNumList: string[] = [];
  facilityRevTypesList: any[] = [];
  logs: Array<[number, number, string | Date, number, string, string, number]> = [];
  toggleMachineColText: number = 0;
  form_period_length: number = 0;
  detailedLog: any = null;
  orderingAsc: boolean = false; // true platí pro řazení od nejstarších po nejnovější


  showDetails(logID: number) {
    this.detailedLog = this.logs.find(log => log[0] === logID);
    this.dialogContent = 'details';
    this.showDialog = true;
  }

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
      this.filterI.hiddenStyleUpdate();
    });
    this.getMachines();
    this.getRevTypes();
    this.getLogs();

    this.filterI.filterValues = {
      machineName: '',
      machineInNum: '',
      revType: '',
      minDate: '',
      maxDate: '',
      result: ''
    }
  }
  
  // cross table getters
  logGet = {
    revType: (log: any[]): string => {
      return this.revTypesList[log[3]-1][1];
    },
    machine: (log: any[]): string => {
      return this.machinesList[log[1]][2];
    },
    machineInNum: (log: any[]): string => {
      return this.machinesList[log[1]][1];
    },
    employeeFromLog: (log: any[]): string => {
      const employees = getEmployees(this.eel_on);
      if (!employees) {
        return 'Chyba načtení zaměstnanců';
      }
      const emp = employees.find(e => e[0] === log[6]);
      return emp ? emp[1] : 'Neznámý zaměstnanec';
    },
    employee: (employee: any[]): string => {
      const employees = getEmployees(this.eel_on);
      if (!employees) {
        return 'Chyba načtení zaměstnanců';
      }
      const emp = employees.find(e => e[0] === employee[0]);
      return emp ? emp[1] : 'Neznámý zaměstnanec';
    }
  };

  get employeesList() {
    return getEmployees(this.eel_on);
  }

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

  getLogs() {
    if (!this.eel_on){
      this.logs = [
        [2, 1, '2025-01-12', 1, 'bez závady', 'TEST - Vše proběhlo hladce.', 1],
        [6, 2, '2025-02-10', 3, 'bez závady', 'TEST - Kontrola bez zjištěných problémů.', 2],
        [3, 1, '2025-03-08', 1, 'malá závada', 'TEST - Opotřebený filtr – vyměněno.', 2],
        [4, 1, '2025-04-15', 2, 'bez závady', 'TEST - Parametry v normě.', 2],
        [7, 2, '2025-05-03', 3, 'malá závada', 'TEST - Vyosený modul – seřízeno.', 3],
        [5, 1, '2025-06-21', 2, 'velká závada', 'TEST - Chyba řídící jednotky – nutný servis.', 1],
        [8, 2, '2025-07-19', 5, 'bez závady', 'TEST - Zátěžový test OK.', 3],
        [9, 2, '2025-09-01', 5, 'velká závada', 'TEST - Přehřívání motoru – čeká na náhradní díl.', 1],
        [1, 1, '2025-10-29', 2, 'bez závady', 'test', 1],
      ];
      this.logs.map(log => {
        log[2] = new Date(log[2]);
      });
      return;
    }
  }
  switchOrder() {
    this.logs.reverse();
  }

  strDate(dateObj: Date | string): string {
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    return new Intl.DateTimeFormat('cs-CZ', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateObj);
  }

  rowFiltered(entry: any[]){
    const revTypeName = this.logGet.revType(entry);
    const machineName = this.logGet.machine(entry);
    const machineInNum = this.logGet.machineInNum(entry);
    const date = entry[2];
    const result = entry[4];
    
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
      (this.filterI.filterValues['minDate'] && date < new Date(this.filterI.filterValues['minDate'])) ||
      (this.filterI.filterValues['maxDate'] && date > new Date(this.filterI.filterValues['maxDate'])) ||
      (result && !result.toLowerCase().includes(this.filterI.filterValues['result'].toLowerCase()))
    ) {
      return false;
    } else {
      return true;
    }
  }

  // isFacility(revTypeID: number){
  //   return '';
  // }

  onSubmit(event: any) {
    event.preventDefault();
    const revTypeID = this.revTypeAddRef.nativeElement.value;
    const machineID = this.machineAddRef.nativeElement.value;
    const employeeID = this.employeeAddRef.nativeElement.value;
    const date = this.dateAddRef.nativeElement.value;
    const result = this.resultAddRef.nativeElement.value;
    const notes = this.notesAddRef.nativeElement.value;

    if (!revTypeID || !machineID || !employeeID || !date || !result) {
      this.dialogContent = 'errorMissingFields';
      this.showDialog = true;
      return;
    } else if (date > new Date().toISOString().split('T')[0]) {
      this.dialogContent = 'errorInvalidDate';
      this.showDialog = true;
      return;
    }


    if (this.eel_on) {
      eel.add_revision_log(parseInt(revTypeID), parseInt(machineID), date, parseInt(employeeID), result, notes)().then((result: any) => {
        console.log("Výsledek přidání revize:", result);
        if (result.success) {
          this.dialogContent = 'addSuccess';
          this.showDialog = true;
          this.getLogs();
        } else {
          this.dialogContent = 'unknownError';
          this.showDialog = true;
          return;
        }
      });
    } else {
      this.logs.push([
        this.logs.length + 1,
        parseInt(machineID),
        new Date(date),
        parseInt(revTypeID),
        result,
        notes,
        parseInt(employeeID)
      ]);
      this.dialogContent = 'addSuccess';
      this.showDialog = true;
    }

    this.revTypeAddRef.nativeElement.value = '';
    this.machineAddRef.nativeElement.value = '';
    this.employeeAddRef.nativeElement.value = '';
    this.dateAddRef.nativeElement.value = '';
    this.resultAddRef.nativeElement.value = '';
    this.notesAddRef.nativeElement.value = '';
  }
  removeLog() {
    const logID = this.logRemRef.nativeElement.value;
    if (!logID) {
      this.dialogContent = 'errorMissingFields';
      this.showDialog = true;
      return;
    }
    if (this.eel_on) {
      eel.remove_revision_log(logID)().then((result: any) => {
        // console.log("Výsledek odstranění periodicity:", result);
        if (result.success) {
          this.dialogContent = 'removeSuccess';
          this.showDialog = true;
          this.getLogs();
        } else {
          this.dialogContent = 'unknownEelError';
          this.showDialog = true;
          return;
        }
      });
    } else {
      this.logs = this.logs.filter(p => p[0] != logID);
      this.dialogContent = 'removeSuccess';
      this.showDialog = true;
    }
    this.revTypeRem = '';
    this.machineRem = '';
    this.logRemRef.nativeElement.value = '';
  }

  remFilter(log: any[]){
    const machineID = this.machineRem;
    const revTypeID = this.revTypeRem;
    if (
      (machineID && log[1] != machineID) ||
      (revTypeID && log[3] != revTypeID)
    ) {
      return false;
    } else {
      return true;
    }
  }
}

export function getRevLogs(eel_on: boolean) {
  if (!eel_on){
    return [ // ID, machineID, date, revTypeID, status, notes
      [2, 1, "2025-01-12", 1, 'bez závady', 'TEST - Vše proběhlo hladce.'],
      [6, 2, "2025-02-10", 3, 'bez závady', 'TEST - Kontrola bez zjištěných problémů.'],
      [3, 1, "2025-03-08", 1, 'malá závada', 'TEST - Opotřebený filtr – vyměněno.'],
      [4, 1, "2025-04-15", 2, 'bez závady', 'TEST - Parametry v normě.'],
      [7, 2, "2025-05-03", 3, 'malá závada', 'TEST - Vyosený modul – seřízeno.'],
      [5, 1, "2025-06-21", 2, 'velká závada', 'TEST - Chyba řídící jednotky – nutný servis.'],
      [8, 2, "2025-07-19", 5, 'bez závady', 'TEST - Zátěžový test OK.'],
      [9, 2, "2025-09-01", 5, 'velká závada', 'TEST - Přehřívání motoru – čeká na náhradní díl.'],
      [1, 1, "2025-10-29", 2, 'bez závady', 'test'],
    ].map((log: any[]) => {
      log[2] = new Date(log[2]);
      return log;
    });
  } else {
    eel.list_revision_logs()().then((result: any) => {
      console.log("Výsledek:", result);
      return result;
    });
  }
  return ["Problém s eel."];
}