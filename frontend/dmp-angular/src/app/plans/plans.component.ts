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

  constructor(private modeService: ModeService) {}
  async ngOnInit() {
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
    await this.loadPlan('test_plan.json');
    this.parsePlan();
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

  parsePlan() {
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
        calendar[month_key].machines.push([rev[1],...machine_info]);
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
        calendar[month_key].people.push([training[1], person[1]]); // training type, name
        if (training_date < min_date) min_date = training_date; // update min_date
        if (training_date > max_date) max_date = training_date; // update max_date
      });
    });

    // fill unused months
    let date_generator = new Date(min_date.getFullYear(), min_date.getMonth(), 1);
    while (date_generator <= max_date) {
      const month_key = `${date_generator.getFullYear()}-${date_generator.getMonth() + 1}`;
      if (!calendar[month_key]) {
        calendar[month_key] = { machines: [], people: [] };
      }
      date_generator.setMonth(date_generator.getMonth() + 1);
    }
    this.calendar = calendar;
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
}
