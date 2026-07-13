import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Reagente } from '../../interfaces/reagente.interface';
import { VisualEstado } from '../../interfaces/visual-estado.interface';

@Component({
  selector: 'app-test-tube',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './test-tube.component.html',
  styleUrls: ['./test-tube.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTubeComponent {
  @Input({ required: true }) visual!: VisualEstado;
  @Input() hoverTubo = false;
  @Input() hoverChama = false;
  @Input() reagenteSelecionado: Reagente | null = null;
  @Input() tuboEstilo: Record<string, string> | null = null;
  @Input() mostrarBolhas = false;
  @Input() mostrarFumaca = false;
  @Input() mostrarAura = false;
  @Input() bolhasDecorativas: number[] = [];
  @Input() fumacaDecorativa: number[] = [];
  @Input() dicaTubo = '';

  @Output() tuboDragOver = new EventEmitter<DragEvent>();
  @Output() tuboDragLeave = new EventEmitter<void>();
  @Output() tuboDrop = new EventEmitter<DragEvent>();
  @Output() tuboPointerDown = new EventEmitter<MouseEvent>();

  trackByDecorativo(index: number, item: number): number {
    return item;
  }
}
