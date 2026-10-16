import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Etapa } from '../../interfaces/etapa.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco da topbar
@Component({
  selector: 'app-simulacao-topbar',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  @Input({ required: true }) etapas: Etapa[] = [];
  @Input() etapaCorrente: number | null = null;
  @Input() navegacaoLivre = false;

  @Output() abrirPerfil = new EventEmitter<MouseEvent>();
  @Output() selecionarEtapa = new EventEmitter<number>();

  // bloco do modo apresentacao
  clicarEtapa(etapa: Etapa): void {
    if (this.navegacaoLivre && etapa.id !== this.etapaCorrente) {
      this.selecionarEtapa.emit(etapa.id);
    }
  }

  trackByEtapa(index: number, etapa: Etapa): number {
    return etapa.id;
  }
}
