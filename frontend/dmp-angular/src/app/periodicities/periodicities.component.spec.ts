import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicitiesComponent } from './periodicities.component';

describe('PeriodicitiesComponent', () => {
  let component: PeriodicitiesComponent;
  let fixture: ComponentFixture<PeriodicitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodicitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodicitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
