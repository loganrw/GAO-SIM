import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDeckComponent } from './main-deck.component';

describe('MainDeckComponent', () => {
  let component: MainDeckComponent;
  let fixture: ComponentFixture<MainDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainDeckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
