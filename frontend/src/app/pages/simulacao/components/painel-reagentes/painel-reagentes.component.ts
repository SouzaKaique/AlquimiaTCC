import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Acao } from '../../interfaces/acao.interface';
import { Reagente } from '../../interfaces/reagente.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco dos reagentes
@Component({
  selector: 'app-painel-reagentes',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './painel-reagentes.component.html',
  styleUrls: ['./painel-reagentes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PainelReagentesComponent {
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
