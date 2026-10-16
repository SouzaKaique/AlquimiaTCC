import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CenaCard } from '../../interfaces/cena.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// card de texto da bancada (solucao-mae, precipitado, sobrenadante)
@Component({
  selector: 'app-bench-card',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './bench-card.component.html',
  styleUrls: ['./bench-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BenchCardComponent {
  @Input({ required: true }) card!: CenaCard;
  @Input() variante: 'main' | 'side' | 'side-bottom' = 'main';
}
