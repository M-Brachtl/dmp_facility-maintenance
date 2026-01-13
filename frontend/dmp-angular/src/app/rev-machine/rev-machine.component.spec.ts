import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevMachineComponent } from './rev-machine.component';

describe('RevMachineComponent', () => {
  let component: RevMachineComponent;
  let fixture: ComponentFixture<RevMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevMachineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
