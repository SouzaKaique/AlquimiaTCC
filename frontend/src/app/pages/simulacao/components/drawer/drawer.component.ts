import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// menu lateral do perfil: laboratorio, quiz, relatorio e sair
@Component({
  selector: 'app-simulacao-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrawerComponent {
  @Input() aberto = false;
  @Input() usuarioNome = 'Usuário';

  @Output() fechar = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();
}
