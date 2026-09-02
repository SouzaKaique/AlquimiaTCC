import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { DrawerComponent } from '../simulacao/components/drawer/drawer.component';
import { TopbarComponent } from '../simulacao/components/topbar/topbar.component';
import { EstadoSimulacao } from '../simulacao/models/estado-simulacao.model';
import { SimulacaoApiService } from '../simulacao/services/simulacao-api.service';
import { TextoVisivelPipe } from '../../shared/pipes/texto-visivel.pipe';
import { RelatorioPdfService } from '../../shared/services/relatorio-pdf.service';

@Component({
  selector: 'app-relatorio',
  standalone: true,
  imports: [CommonModule, DrawerComponent, TopbarComponent, TextoVisivelPipe],
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatorioComponent implements OnInit {
  private readonly simulacaoApi = inject(SimulacaoApiService);
  private readonly pdfService = inject(RelatorioPdfService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly estado = signal<EstadoSimulacao | null>(null);
  readonly carregando = signal(true);
  readonly erro = signal('');
  readonly menuPerfilAberto = signal(false);
  readonly usuarioNome = signal(localStorage.getItem('usuario_nome') || 'Usuário');

  readonly gruposConcluidos = computed(
    () =>
      this.estado()?.etapas.filter((etapa) => [1, 2, 3].includes(etapa.id) && etapa.concluida)
        .length ?? 0,
  );
  readonly historicoRecente = computed(() => this.estado()?.historico.slice(-10) ?? []);
  readonly resumo = computed(() => this.estado()?.resumo_final ?? []);
  readonly precipitacoes = computed(() => this.estado()?.precipitacoes ?? []);

  ngOnInit(): void {
    this.simulacaoApi.obterEstado().subscribe({
      next: (resposta) => {
        this.estado.set(resposta.estado);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar o relatório. Inicie ou conclua uma simulação.');
        this.carregando.set(false);
      },
    });
  }

  exportarPdf(): void {
    const estado = this.estado();
    if (!estado) {
      return;
    }

    void this.pdfService.exportar(estado);
  }

  alternarMenuPerfil(event?: MouseEvent): void {
    event?.stopPropagation();
    this.menuPerfilAberto.update((valor) => !valor);
  }

  fecharMenuPerfil(): void {
    this.menuPerfilAberto.set(false);
  }

  logout(): void {
    this.fecharMenuPerfil();
    this.authService.encerrarSessao();
    window.location.assign('/');
  }

  voltarLaboratorio(): void {
    this.router.navigate(['/simulacao']);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByEtapa(index: number, etapa: { id: number }): number {
    return etapa.id;
  }
}
