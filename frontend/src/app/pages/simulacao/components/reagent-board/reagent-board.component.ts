import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Acao } from '../../interfaces/acao.interface';
import { Reagente } from '../../interfaces/reagente.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

@Component({
  selector: 'app-reagent-board',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './reagent-board.component.html',
  styleUrls: ['./reagent-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReagentBoardComponent {
  @Input() destaque = '';
  @Input() totalReagentes = 0;
  @Input() reagenteSelecionado: Reagente | null = null;
  @Input() reagenteAtivoTexto = '';
  @Input() reagentes: Reagente[] = [];
  @Input() acoes: Acao[] = [];

  @Output() selecionarReagente = new EventEmitter<Reagente>();
  @Output() iniciarArrasteReagente = new EventEmitter<{ event: DragEvent; reagente: Reagente }>();
  @Output() executarAcao = new EventEmitter<string>();

  trackByReagente(index: number, reagente: Reagente): string {
    return reagente.nome;
  }

  trackByAcao(index: number, acao: Acao): string {
    return acao.nome;
  }
}
