import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialDeckComponent } from './material-deck.component';

describe('MaterialDeckComponent', () => {
  let component: MaterialDeckComponent;
  let fixture: ComponentFixture<MaterialDeckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MaterialDeckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaterialDeckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
