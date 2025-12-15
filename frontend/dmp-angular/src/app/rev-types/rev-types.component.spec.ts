import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevTypesComponent } from './rev-types.component';

describe('RevTypesComponent', () => {
  let component: RevTypesComponent;
  let fixture: ComponentFixture<RevTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
