import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TesteChama } from '../../interfaces/teste-chama.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bloco do bico de bunsen
@Component({
  selector: 'app-bico-bunsen',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './bico-bunsen.component.html',
  styleUrls: ['./bico-bunsen.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BicoBunsenComponent {
  @Input() hoverChama = false;
  @Input() testeChama: TesteChama | null = null;
  @Input() fogoAtivo = false;
  @Input() mensagem = '';

  @Output() alternarChama = new EventEmitter<void>();

  get chamaAtiva(): boolean {
    return this.fogoAtivo || !!this.testeChama?.ativa;
  }

  get corChama(): string {
    return this.testeChama?.cor || '#58c8ff';
  }
}
