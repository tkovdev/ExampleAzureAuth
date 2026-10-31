import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegatedAdministrationComponent } from './delegated-administration.component';

describe('DelegatedAdministrationComponent', () => {
  let component: DelegatedAdministrationComponent;
  let fixture: ComponentFixture<DelegatedAdministrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelegatedAdministrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelegatedAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
