import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModeService } from '../mode.service';
import { HeaderBtnsComponent } from '../header-btns/header-btns.component';
import { FormsModule } from '@angular/forms';
// import { DialogContainerComponent } from '../dialog-container/dialog-container.component';

declare const eel: any;

@Component({
  selector: 'app-rev-types',
  imports: [HeaderBtnsComponent, FormsModule],
  templateUrl: './rev-types.component.html',
  styleUrl: './rev-types.component.scss'
})
export class RevTypesComponent {
  mode!: 'list' | 'add' | 'remove';
  revTypesList: any[] = [];
  facilityRevTypesList: any[] = [];
  filtersShow: number = 1;
  eel_on: boolean = false; // bez eel jsou použitá testovací data přímo v kódu
  filterHiddenStyleValue: string = '';
  filterHiddenStyle(): void {
    this.filterHiddenStyleValue = this.filtersShow ? 'max-table-h-filter-shown' : 'max-table-h-filter-hidden';
  }
  filtersShowHideIcons: string[] = [
    'assets/show.svg',
    'assets/hide.svg',
  ]

  nameFilter: string = '';
  typeFilter: string = 'all'; // is/is not facility/all

  constructor(private route: ActivatedRoute, private modeService: ModeService) {}
  ngOnInit() {
    this.route.url.subscribe(url => {
      console.log('Current route:', url);
    });
    this.modeService.mode$.subscribe(mode => {
      this.mode = mode;
    });
    this.getRevTypes();
    this.filterHiddenStyle();
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

  deleteFilters() {
    this.nameFilter = '';
    this.typeFilter = 'all';
  }

  rowFiltered(revType: any): boolean { // vrací true, pokud řádek vyhovuje filtrům
    if (this.nameFilter && !revType[1].toLowerCase().includes(this.nameFilter.toLowerCase())) {
      return false;
    } else if (this.typeFilter === 'is' && revType[3] != 1) {
      return false;
    } else if (this.typeFilter === 'is not' && revType[3] != 0) {
      return false;
    }
    return true;
  }

  isFacility(revType: any): string {
    return revType[3] == 1 ? 'text-indigo-700 font-bold' : '';
  }

  toggleFilters() {
    this.filtersShow = 1-this.filtersShow;
    this.filterHiddenStyle();
  }
}
