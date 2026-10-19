import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CenaCard } from '../../interfaces/cena.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco dos cards da bancada
@Component({
  selector: 'app-cartao-bancada',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './cartao-bancada.component.html',
  styleUrls: ['./cartao-bancada.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartaoBancadaComponent {
  @Input({ required: true }) card!: CenaCard;
  @Input() variante: 'main' | 'side' | 'side-bottom' = 'main';
}
