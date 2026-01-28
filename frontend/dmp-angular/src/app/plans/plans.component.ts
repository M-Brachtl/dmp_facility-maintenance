import { Component } from '@angular/core';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
// import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

declare const eel: any;

@Component({
  selector: 'app-plans',
  imports: [HeaderBtnsComponent, FormsModule],
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.scss',
})
export class PlansComponent {
  mode!: 'list' | 'add' | 'remove';
  eel_on: boolean = false;
  current_plan: { title: string; active: boolean; machines: any[]; people: any[] } = { title: '', active: false, machines: [], people: [] };
  calendar: { [key: string]: { machines: string[][]; people: string[][] } } = {};
  next_month_cal: { [key: string]: { machines: string[][]; people: string[][] } } = {};
  fill_used = false;
  filter_showing = false;
  min_date?: string;
  max_date?: string;
  
  keyIsToday(key: string){
    const [year, month] = key.split('-').map(Number);
    const today = new Date();
    return year === today.getFullYear() && month === (today.getMonth() + 1);
  }

  get iconPath(): string {
    return this.filter_showing ? 'assets/hide.svg' : 'assets/show.svg';
  }

  get tableMaxHeightClass(): string {
    return this.filter_showing ? 'max-table-h-filter-shown' : 'max-table-h-filter-hidden';
  }

  deleteFilters(): void {
    this.fill_used = true;
    this.min_date = undefined;
    this.max_date = undefined;
    this.parsePlan();
  }

  constructor(private modeService: ModeService) {}
  async ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
    await this.loadPlan('test_plan.json');
    this.parsePlan(false);
    this.parsePlan(true);
    console.log('Calendar:', this.calendar);
  }

  async loadPlan(filename: string): Promise<void> {
    if (this.eel_on) {
      return new Promise((resolve, reject) => {
        eel.get_plan(filename)((plan: any) => {
          this.current_plan = plan;
          resolve(); // signalizuje dokončení
        });
      });
    } else {
      return fetch(`http://localhost:4200/${filename}`)
        .then(response => response.json())
        .then(plan => {
          this.current_plan = plan;
          console.log('Received plan:', plan);
        })
        .catch(error => {
          console.error('Error fetching plan:', error);
        });
    }
  }
  strDate(dateObj: Date | string): string {
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    return new Intl.DateTimeFormat('cs-CZ', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(dateObj);
  }
  getISOWeekNumber(date: any): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  
    // Set to nearest Thursday (ISO week starts Monday)
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  
    // Year start
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
    // Calculate week number
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  isBeforeToday(date: any){
    console.log(date, date < new Date())
    return date <new  Date() ? 'bg-red-500' : '';
  }

  applyFilters(min_date_str?: string, max_date_str?: string): void {
    let custom_min_date: Date | undefined;
    let custom_max_date: Date | undefined;
    if (min_date_str) {
      custom_min_date = new Date(min_date_str);
    }
    if (max_date_str) {
      custom_max_date = new Date(max_date_str);
    }
    this.parsePlan(false, this.fill_used, custom_min_date, custom_max_date);
  }
  parsePlan(nextMonth: boolean = false, fill_unused: boolean = true, custom_min_date?: Date, custom_max_date?: Date): void {
    // dates are updated so unused months are filled after parsing
    let min_date = new Date(); // set to current date initially
    let max_date = min_date; // set to current date initially
    // key example: "2025-11" means: November 2025
    let calendar: { [key: string]: { machines: string[][]; people: string[][] } } = {};
    this.current_plan.machines.forEach(machine => {
      const machine_info = [machine[1], machine[2]]; // in_num, name
      machine[3].forEach((rev: any) => {
        const rev_date = new Date(rev[2]);
        const month_key = `${rev_date.getFullYear()}-${rev_date.getMonth() + 1}`;
        if (!calendar[month_key]) {
          calendar[month_key] = { machines: [], people: [] };
        }
        calendar[month_key].machines.push([rev_date, rev[1],...machine_info]);
        if (rev_date < min_date) min_date = rev_date; // update min_date
        if (rev_date > max_date) max_date = rev_date; // update max_date
      });
    })
    this.current_plan.people.forEach((person: any) => {
      person[2].forEach((training: any) => {
        const training_date = new Date(training[2]);
        const month_key = `${training_date.getFullYear()}-${training_date.getMonth() + 1}`;
        if (!calendar[month_key]) {
          calendar[month_key] = { machines: [], people: [] };
        }
        calendar[month_key].people.push([training_date, training[1], person[1]]); // training type, name
        if (training_date < min_date) min_date = training_date; // update min_date
        if (training_date > max_date) max_date = training_date; // update max_date
      });
    });

    if (custom_min_date && !nextMonth) {
      min_date = custom_min_date;
      // delete all months before custom_min_date
      for (const key in calendar) {
        const [year, month] = key.split('-').map(Number);
        const key_date = new Date(year, month - 1, 1);
        if (key_date < custom_min_date) {
          delete calendar[key];
        }
      }
    }
    if (nextMonth){
      max_date = new Date()
      max_date.setMonth(max_date.getMonth() + 2);
      console.log("Next month cal:", max_date)
      // delete all months after custom_max_date
      for (const key in calendar) {
        const [year, month] = key.split('-').map(Number);
        const key_date = new Date(year, month - 1, 1);
        if (key_date > max_date) {
          delete calendar[key];
        }
      }
    } else if (custom_max_date) {
      max_date = custom_max_date;
      // delete all months after custom_max_date
      for (const key in calendar) {
        const [year, month] = key.split('-').map(Number);
        const key_date = new Date(year, month - 1, 1);
        if (key_date > custom_max_date) {
          delete calendar[key];
        }
      }
    }
    
    // fill unused months
    if (fill_unused){
      let date_generator = new Date(min_date.getFullYear(), min_date.getMonth(), 1);
      while (date_generator <= max_date) {
        const month_key = `${date_generator.getFullYear()}-${date_generator.getMonth() + 1}`;
        if (!calendar[month_key]) {
          calendar[month_key] = { machines: [], people: [] };
        }
        date_generator.setMonth(date_generator.getMonth() + 1);
      }
    }
    if (nextMonth){
      this.next_month_cal = calendar
    } else {
      this.calendar = calendar
    }
  }

  get calendarKeyList(): string[][] {
    /*
      [2025-11, 2025-12, ...],
      [2026-01, 2026-02, ...],
      [2027-01, 2027-02, ...],
    */
    const keys = Object.keys(this.calendar).sort((a, b) => {
      const [aYear, aMonth] = a.split('-').map(Number);
      const [bYear, bMonth] = b.split('-').map(Number);
      return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
    });
    const groupedKeys: string[][] = [];
    let currentYear = '';
    keys.forEach(key => {
      const [year, month] = key.split('-');
      if (year !== currentYear) {
        currentYear = year;
        groupedKeys.push([]);
      }
      groupedKeys[groupedKeys.length - 1].push(key);
    });
    return groupedKeys;
  }

  get calNextMonthKeyList(): string[][] {
    /*
      [2025-11, 2025-12, ...],
      [2026-01, 2026-02, ...],
      [2027-01, 2027-02, ...],
    */
    const keys = Object.keys(this.next_month_cal).sort((a, b) => {
      const [aYear, aMonth] = a.split('-').map(Number);
      const [bYear, bMonth] = b.split('-').map(Number);
      return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
    });
    const groupedKeys: string[][] = [];
    let currentYear = '';
    keys.forEach(key => {
      const [year, month] = key.split('-');
      if (year !== currentYear) {
        currentYear = year;
        groupedKeys.push([]);
      }
      groupedKeys[groupedKeys.length - 1].push(key);
    });
    return groupedKeys;
  }

  showCurrentMonth(): void {
    const element = document.querySelector(`.today-cell`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
