import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanishZoneComponent } from './banish-zone.component';

describe('BanishZoneComponent', () => {
  let component: BanishZoneComponent;
  let fixture: ComponentFixture<BanishZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BanishZoneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BanishZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
