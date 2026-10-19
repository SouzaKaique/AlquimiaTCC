import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TesteChama } from '../../interfaces/teste-chama.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco da caixa de status
@Component({
  selector: 'app-caixa-status',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './caixa-status.component.html',
  styleUrls: ['./caixa-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaixaStatusComponent {
  @Input() mensagem = '';
  @Input() etapaLabel = 'Introdução';
  @Input() testeChama: TesteChama | null = null;
}
