import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { filterInterface } from '../filterInterface';
import { FormsModule } from '@angular/forms';
import { getRevTypes } from '../rev-types/rev-types.component';
// import { getMachines } from '../machines/machines.component';
import { getEmployees } from '../employees/employees.component';
import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

declare const eel: any;

@Component({
  selector: 'app-trainings',
  imports: [HeaderBtnsComponent, DialogContainerComponent, FormsModule],
  templateUrl: './trainings.component.html',
  styleUrl: './trainings.component.scss'
})
export class TrainingsComponent {
  @ViewChild('revTypeAdd') revTypeAddRef!: ElementRef;
  @ViewChild('employeeAdd') employeeAddRef!: ElementRef;
  // @ViewChild('employeeRem') employeeRemRef!: ElementRef;
  @ViewChild('dateAdd') dateAddRef!: ElementRef;
  @ViewChild('logRem') logRemRef!: ElementRef;
  revTypeRem = '';
  employeeRem = '';

  mode!: 'list' | 'add' | 'remove';
  filterI = new filterInterface();
  revTypesList: any[] = [];
  eel_on!: boolean; // bez eel jsou použitá testovací data přímo v kódu
  showDialog: boolean = false;
  dialogContent: string = '';
  // machinesList: any[] = [];
  // inNumList: string[] = [];
  employeesList: any[] = [];
  facilityRevTypesList: any[] = [];
  toggleMachineColText: number = 0;
  form_period_length: number = 0;
  detailedLog: any = null;
  orderingAsc: boolean = false; // true platí pro řazení od nejstarších po nejnovější
  TLogs: any[] = [];
  sorter: number = 3; // date/expiry_date = 3/4
  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  async ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
    this.modeService.eel_on$.subscribe(status => {
      this.eel_on = status;
    });
    this.revTypesList = await getRevTypes(this.eel_on);
    // [this.machinesList, this.inNumList] = getMachines(this.eel_on);
    this.getTLogs();
    console.log("Employees list before fetch:", this.employeesList);
    this.employeesList = await getEmployees(this.eel_on);
    this.filterI.filterValues = {
      revType: '',
      minDate: '',
      maxDate: '',
      employee: '',
      minEDate: '',
      maxEDate: '',
    };
  }

  strDate(dateObj: Date | string): string {
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    return new Intl.DateTimeFormat('cs-CZ', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateObj);
  }

  getTLogs() {
    if (this.eel_on) {
      eel.list_training_log()((ret: any) => {
        this.TLogs = ret.map((log: any[]) => {
          // console.log("Výsledek training:", ret);
          log[3] = new Date(log[3]);
          log[4] = new Date(log[4]);
          return log;
        });
      });
    } else {
      console.log('Eel is not initialized.');
      this.TLogs = [ // id, rev_type_id, employee_id, date, expiry_date
        [1, 1, 1, "2025-11-07", "2026-11-07"],
        [2, 1, 2, "2024-06-15", "2025-06-15"],
        [3, 2, 2, "2026-01-21", "2028-01-21"],
        [4, 5, 3, "2024-07-20", "2029-07-20"]
      ];
    }
    this.TLogs.map( log => {
      log[3] = new Date(log[3]);
      log[4] = new Date(log[4]);
    } );
    this.TLogs.sort( (a, b) => {
      return a[this.sorter] - b[this.sorter]; 
    } );
  }
  switchOrder() {
    this.TLogs.reverse();
  }
  switchSorter(sortBy: number) {
    this.sorter = sortBy;
    this.TLogs.sort( (a, b) => {
      return a[this.sorter] - b[this.sorter]; 
    } );
    if (this.orderingAsc) {
      this.TLogs.reverse();
    }
  }
  
  logGet = {
    revType: (log: any[]): string => {
      return this.revTypesList[log[1]-1][1];
    },
    periodicity: (log: any[]): string => {
      return this.revTypesList[log[1]-1][2] + ' měsíců';
    },
    employeeFromLog: (log: any[]): string => {
      // console.log(this.employeesList, log);
      try {
        console.log("Found employee:", this.employeesList);
        return this.employeesList[log[2]-1][1];
      } catch (error) {
        return 'Unknown Employee';
      }
    },
    employee: (employee: any[]): string => {
      this.employeesList.find( emp => emp[0] === employee[0] );
      return employee[1];
    }
  };

  rowFiltered(entry: any[]): boolean {
    if (this.revTypesList.length === 0 || this.employeesList.length === 0) {
      return true;
    }
    const employeeName = this.logGet.employeeFromLog(entry);
    const revTypeName = this.logGet.revType(entry);
    const date = entry[3];
    const eDate = entry[4];

    if (
      (revTypeName && !revTypeName.toLowerCase().includes(this.filterI.filterValues['revType'].toLowerCase())) ||
      (employeeName && !employeeName.toLowerCase().includes(this.filterI.filterValues['employee'].toLowerCase())) ||
      (this.filterI.filterValues['minDate'] && date < new Date(this.filterI.filterValues['minDate'])) ||
      (this.filterI.filterValues['maxDate'] && date > new Date(this.filterI.filterValues['maxDate'])) ||
      (this.filterI.filterValues['minEDate'] && eDate < new Date(this.filterI.filterValues['minEDate'])) ||
      (this.filterI.filterValues['maxEDate'] && eDate > new Date(this.filterI.filterValues['maxEDate']))
    ) {
      return false;
    } else {
      return true;
    }
  }

  showDetails(logID: number) {
    this.detailedLog = this.TLogs.find(log => log[0] === logID);
    this.dialogContent = 'details';
    this.showDialog = true;
  }

  onSubmit(event: any) {
    event.preventDefault();
    const revTypeID = this.revTypeAddRef.nativeElement.value;
    const employeeID = this.employeeAddRef.nativeElement.value;
    const date = this.dateAddRef.nativeElement.value;

    if (!revTypeID || !employeeID || !date) {
      this.dialogContent = 'errorMissingFields';
      this.showDialog = true;
      return;
    } else if (date > new Date().toISOString().split('T')[0]) {
      this.dialogContent = 'errorInvalidDate';
      this.showDialog = true;
      return;
    }


    if (this.eel_on) {
      eel.add_training_log(parseInt(revTypeID), parseInt(employeeID), date)().then((result: any) => {
        console.log("Výsledek přidání revize:", result);
        if (result === "success") {
          this.dialogContent = 'addSuccess';
          this.showDialog = true;
          this.getTLogs();
        } else {
          this.dialogContent = 'unknownError';
          this.showDialog = true;
          return;
        }
      });
    } else {
      this.TLogs.push([
        this.TLogs.length + 1,
        parseInt(revTypeID),
        parseInt(employeeID),
        new Date(date),
        new Date(new Date(date).setMonth(new Date(date).getMonth() + this.revTypesList[parseInt(revTypeID)-1][2]))
      ]);
      this.dialogContent = 'addSuccess';
      this.showDialog = true;
    }

    this.revTypeAddRef.nativeElement.value = '';
    this.employeeAddRef.nativeElement.value = '';
    this.dateAddRef.nativeElement.value = '';
  }
  remFilter(log: any[]){
    const revTypeID = this.revTypeRem;
    const employeeID = this.employeeRem;
    if (
      (employeeID && log[2] != employeeID) ||
      (revTypeID && log[1] != revTypeID)
    ) {
      return false;
    } else {
      return true;
    }
  }

  removeLog() {
    const logID = this.logRemRef.nativeElement.value;
    if (!logID) {
      this.dialogContent = 'errorMissingFields';
      this.showDialog = true;
      return;
    }
    if (this.eel_on) {
      eel.remove_training_log(logID)().then((result: any) => {
        // console.log("Výsledek odstranění periodicity:", result);
        if (result === "success") {
          this.dialogContent = 'removeSuccess';
          this.showDialog = true;
          this.getTLogs();
        } else {
          this.dialogContent = 'unknownEelError';
          this.showDialog = true;
          return;
        }
      });
    } else {
      this.TLogs = this.TLogs.filter(p => p[0] != logID);
      this.dialogContent = 'removeSuccess';
      this.showDialog = true;
    }
    this.revTypeRem = '';
    this.employeeRem = '';
    this.logRemRef.nativeElement.value = '';
  }
}
