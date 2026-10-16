import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TesteChama } from '../../interfaces/teste-chama.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco da caixa de status
@Component({
  selector: 'app-status-box',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './status-box.component.html',
  styleUrls: ['./status-box.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBoxComponent {
  @Input() mensagem = '';
  @Input() etapaLabel = 'Introdução';
  @Input() testeChama: TesteChama | null = null;
}
