import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SimulacaoComponent } from './simulacao';

describe('SimulacaoComponent', () => {
  let component: SimulacaoComponent;
  let fixture: ComponentFixture<SimulacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulacaoComponent],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimulacaoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
