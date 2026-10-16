import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TesteChama } from '../../interfaces/teste-chama.interface';
import { TextoVisivelPipe } from '../../../../shared/pipes/texto-visivel.pipe';

// bico de bunsen do grupo 1: clique liga/desliga, area da chama recebe o tubo
@Component({
  selector: 'app-burner',
  standalone: true,
  imports: [CommonModule, TextoVisivelPipe],
  templateUrl: './burner.component.html',
  styleUrls: ['./burner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurnerComponent {
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
