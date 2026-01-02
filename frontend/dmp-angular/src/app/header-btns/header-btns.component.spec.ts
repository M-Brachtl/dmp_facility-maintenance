import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderBtnsComponent } from './header-btns.component';

describe('HeaderBtnsComponent', () => {
  let component: HeaderBtnsComponent;
  let fixture: ComponentFixture<HeaderBtnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderBtnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderBtnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
