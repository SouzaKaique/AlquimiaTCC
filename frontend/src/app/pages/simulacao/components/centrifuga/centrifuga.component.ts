import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { EquipamentoSimulacao } from '../../enums/equipamento-simulacao.enum';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco do agitador e centrifuga
@Component({
  selector: 'app-centrifuga',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './centrifuga.component.html',
  styleUrls: ['./centrifuga.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CentrifugaComponent {
  @Input() equipamento: EquipamentoSimulacao | null = null;
  @Input() titulo = '';
  @Input() instrucao = '';
  @Input() tuboNoEquipamento = false;
  @Input() processamento = false;
  @Input() status = '';
  @Input() botao = '';

  @Output() fechar = new EventEmitter<void>();
  @Output() iniciarArrasteTubo = new EventEmitter<DragEvent>();
  @Output() permitirSoltar = new EventEmitter<DragEvent>();
  @Output() soltarTubo = new EventEmitter<DragEvent>();
  @Output() iniciarProcesso = new EventEmitter<void>();

  readonly equipamentoSimulacao = EquipamentoSimulacao;
}
