import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// bloco do menu lateral
@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuLateralComponent {
  @Input() aberto = false;
  @Input() usuarioNome = 'Usuário';

  @Output() fechar = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();
}
