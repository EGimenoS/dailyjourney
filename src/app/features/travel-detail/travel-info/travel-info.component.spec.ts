import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelInfoComponent } from './travel-info.component';

describe('TravelInfoComponent', () => {
  let component: TravelInfoComponent;
  let fixture: ComponentFixture<TravelInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TravelInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    pending();
    expect(component).toBeTruthy();
  });
});
