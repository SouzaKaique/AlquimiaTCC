import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutAutenticacaoComponent } from './layout-autenticacao.component';

describe('LayoutAutenticacaoComponent', () => {
  let component: LayoutAutenticacaoComponent;
  let fixture: ComponentFixture<LayoutAutenticacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutAutenticacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutAutenticacaoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
