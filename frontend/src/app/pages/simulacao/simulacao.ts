import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { CartaoBancadaComponent } from './components/cartao-bancada/cartao-bancada.component';
import { BicoBunsenComponent } from './components/bico-bunsen/bico-bunsen.component';
import { CentrifugaComponent } from './components/centrifuga/centrifuga.component';
import { MenuLateralComponent } from './components/menu-lateral/menu-lateral.component';
import { PainelReagentesComponent } from './components/painel-reagentes/painel-reagentes.component';
import { CaixaStatusComponent } from './components/caixa-status/caixa-status.component';
import { TuboEnsaioComponent } from './components/tubo-ensaio/tubo-ensaio.component';
import { BarraSuperiorComponent } from './components/barra-superior/barra-superior.component';
import { AutenticacaoService } from '../../core/services/autenticacao';
import { TextoVisivelPipe } from '../../shared/pipes/texto-visivel.pipe';
import { RelatorioPdfService } from '../../shared/services/relatorio-pdf.service';
import { AcaoSimulacao } from './enums/acao-simulacao.enum';
import { EquipamentoSimulacao } from './enums/equipamento-simulacao.enum';
import { Reagente } from './interfaces/reagente.interface';
import { VisualEstado } from './interfaces/visual-estado.interface';
import { EstadoSimulacao } from './models/estado-simulacao.model';
import { SimulacaoApiService } from './services/simulacao-api.service';

@Component({
  selector: 'app-simulacao',
  standalone: true,
  imports: [
    CommonModule,
    CartaoBancadaComponent,
    BicoBunsenComponent,
    CentrifugaComponent,
    MenuLateralComponent,
    PainelReagentesComponent,
    CaixaStatusComponent,
    TuboEnsaioComponent,
    BarraSuperiorComponent,
    TextoVisivelPipe,
  ],
  templateUrl: './simulacao.html',
  styleUrls: ['./simulacao.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SimulacaoComponent implements OnInit, OnDestroy {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly simulacaoApi = inject(SimulacaoApiService);
  private readonly router = inject(Router);
  private readonly relatorioPdf = inject(RelatorioPdfService);


  // bloco do estado da tela
  readonly estado = signal<EstadoSimulacao | null>(null);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly acaoEmAndamento = signal('');

  readonly usuarioNome = signal('Usuário');
  readonly menuPerfilAberto = signal(false);
  readonly modoApresentacao = signal(false);

  readonly reagenteSelecionado = signal<Reagente | null>(null);
  readonly tuboX = signal<number | null>(null);
  readonly tuboY = signal<number | null>(null);
  readonly hoverTubo = signal(false);
  readonly hoverChama = signal(false);
  readonly fogoAtivo = signal(false);

  readonly simuladorEquipamento = signal<EquipamentoSimulacao | null>(null);
  readonly tuboNoEquipamento = signal(false);
  readonly processamentoEquipamento = signal(false);
  readonly contagemEquipamento = signal(0);

  readonly bolhasAtivas = signal(false);
  readonly fumacaAtiva = signal(false);
  readonly auraAtiva = signal(false);
  readonly bolhasDecorativas = [0, 1, 2, 3, 4];
  readonly fumacaDecorativa = [0, 1, 2];

  readonly inicioSessao = Date.now();

  private draggingTube = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private equipamentoTimer: number | null = null;
  private equipamentoInterval: number | null = null;
  private efeitoTimers: number[] = [];


  // bloco dos dados calculados
  readonly etapas = computed(() => this.estado()?.etapas ?? []);
  readonly reagentes = computed(() => this.estado()?.reagentes_disponiveis ?? []);
  readonly acoes = computed(() => this.estado()?.acoes_disponiveis ?? []);
  readonly historico = computed(() => this.estado()?.historico ?? []);
  readonly progresso = computed(() => this.estado()?.progresso ?? 0);
  readonly totalReagentes = computed(() => this.reagentes().length);
  readonly cena = computed(() => this.estado()?.cena ?? null);
  readonly etapaAtual = computed(() => {
    const etapaId = this.estado()?.etapa_corrente;
    return this.etapas().find((etapa) => etapa.id === etapaId) ?? null;
  });
  readonly visual = computed<VisualEstado>(() => {
    return (
      this.estado()?.visual ?? {
        nivel: 48,
        cor_solucao: '#7a8e9b',
        gradiente: 'linear-gradient(180deg, #90a4b2 0%, #7a8e9b 55%, #5e6c78 100%)',
        turva: false,
        precipitado_ativo: false,
        precipitado_cor: '#d7d3c8',
      }
    );
  });
  readonly mensagemReacao = computed(() => {
    if (this.estado()?.etapa_corrente === 0) {
      return 'Cada grupo começa com uma solução-mãe conhecida. Acompanhe os reagentes, as separações e o progresso da marcha.';
    }

    return this.estado()?.observacao_atual || 'Preparando bancada virtual.';
  });


  readonly acoesPainel = computed(() =>
    this.acoes().filter(
      (acao) =>
        acao.nome !== AcaoSimulacao.Aquecer &&
        acao.nome !== AcaoSimulacao.ConfirmarTesteChama,
    ),
  );
  readonly destaqueReagentes = computed(() => {
    if (this.estado()?.etapa_corrente === 1) {
      return 'Arraste um sal conhecido para o tubo. Depois leve o tubo até a chama para observar a cor.';
    }

    if (this.estado()?.etapa_corrente === 2 || this.estado()?.etapa_corrente === 3) {
      return 'Use a bandeja, o agitador e a centrífuga para separar as frações da marcha.';
    }

    return 'A bancada exibe aqui os materiais da etapa atual.';
  });
  readonly reagenteAtivoTexto = computed(() => {
    const reagente = this.reagenteSelecionado();
    return reagente ? `${reagente.nome} pronto para uso.` : 'Nenhum reagente selecionado.';
  });


  readonly testeChamaAguardandoConfirmacao = computed(
    () => this.estado()?.teste_chama.aguardando_confirmacao ?? false,
  );
  readonly burnerMensagem = computed(() => {
    if (this.testeChamaAguardandoConfirmacao()) {
      return 'Teste de chama concluído. Confirme para seguir.';
    }

    if (this.estado()?.teste_chama.ativa) {
      return `${this.estado()!.teste_chama.mensagem} Clique no bico para desligar.`;
    }

    if (this.fogoAtivo() && this.acaoDisponivel(AcaoSimulacao.Aquecer)) {
      return 'Bico aceso. Aproxime o tubo da chama.';
    }

    if (this.fogoAtivo()) {
      return 'Bico aceso.';
    }

    return 'Clique no bico para acender.';
  });


  readonly dicaTubo = computed(() => (this.hoverTubo() ? 'Solte aqui' : ''));
  readonly mostrarBolhas = computed(
    () => this.bolhasAtivas() || this.visual().turva || this.processamentoEquipamento(),
  );
  readonly mostrarFumaca = computed(
    () => this.fumacaAtiva() || this.estado()?.teste_chama.ativa || this.processamentoEquipamento(),
  );
  readonly mostrarAura = computed(
    () => this.auraAtiva() || this.estado()?.teste_chama.ativa || this.visual().precipitado_ativo,
  );
  readonly tuboEstilo = computed(() => {
    const x = this.tuboX();
    const y = this.tuboY();

    if (x === null || y === null) {
      return null;
    }

    return {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'none',
    };
  });


  readonly equipamentoTitulo = computed(() => {
    return this.simuladorEquipamento() === EquipamentoSimulacao.Centrifuga
      ? 'Simulador de centrífuga'
      : 'Simulador de agitação';
  });
  readonly equipamentoInstrucao = computed(() => {
    if (this.simuladorEquipamento() === EquipamentoSimulacao.Centrifuga) {
      return 'Arraste o tubo para a centrífuga, clique em centrifugar e aguarde 5 segundos.';
    }

    return 'Arraste o tubo para o agitador, clique em agitar e aguarde a mistura se completar.';
  });
  readonly equipamentoBotao = computed(() => {
    if (this.processamentoEquipamento()) {
      return this.simuladorEquipamento() === EquipamentoSimulacao.Centrifuga
        ? `Centrifugando... ${this.contagemEquipamento()}s`
        : `Agitando... ${this.contagemEquipamento()}s`;
    }

    return this.simuladorEquipamento() === EquipamentoSimulacao.Centrifuga
      ? 'Centrifugar tubo'
      : 'Agitar tubo';
  });
  readonly equipamentoStatus = computed(() => {
    if (this.processamentoEquipamento()) {
      return this.simuladorEquipamento() === EquipamentoSimulacao.Centrifuga
        ? 'O tubo está em rotação. Aguarde o fim da separação.'
        : 'O tubo está sendo agitado. Aguarde a homogeneização.';
    }

    return this.tuboNoEquipamento()
      ? 'Tubo posicionado. Você já pode iniciar o processo.'
      : 'Posicione o tubo dentro do equipamento para continuar.';
  });


  readonly resumoFinal = computed(() => this.estado()?.resumo_final ?? []);
  readonly resumoPreview = computed(() => this.resumoFinal().slice(0, 3));
  readonly resumoModal = computed(() => this.resumoFinal().slice(0, 4));
  readonly ultimaPrecipitacao = computed(() => this.estado()?.ultima_precipitacao ?? null);
  readonly precipitacoes = computed(() => this.estado()?.precipitacoes ?? []);
  readonly gruposConcluidos = computed(
    () => this.etapas().filter((etapa) => [1, 2, 3].includes(etapa.id) && etapa.concluida).length,
  );
  readonly precipitadosEncontrados = computed(() => {
    const registros = this.precipitacoes().map((item) => item.precipitado);
    if (registros.length) {
      return registros;
    }

    const precipitado = this.cena()?.precipitado?.conteudo;
    return precipitado
      ? [precipitado]
      : this.resumoFinal().filter((item) => /precipitado/i.test(item));
  });
  readonly identificacaoFinal = computed(() => {
    return (
      this.resumoFinal().at(-1) || this.estado()?.observacao_atual || 'Identificação em revisão.'
    );
  });
  readonly tempoGastoTexto = computed(() => {
    this.estado();
    const minutos = Math.max(1, Math.round((Date.now() - this.inicioSessao) / 60000));
    return `${minutos} min`;
  });


  // bloco do ciclo de vida
  ngOnInit(): void {
    this.usuarioNome.set(localStorage.getItem('usuario_nome') || 'Usuário');
    this.modoApresentacao.set(this.autenticacaoService.ehApresentador());

    if (!localStorage.getItem('token')) {
      window.location.assign('/');
      return;
    }

    this.carregarEstadoOuIniciar();
  }

  ngOnDestroy(): void {
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);
    this.limparTimersEquipamento();
    this.limparTimersEfeito();
  }


  // bloco do menu do perfil
  alternarMenuPerfil(event?: MouseEvent): void {
    event?.stopPropagation();
    this.menuPerfilAberto.update((valor) => !valor);
  }

  fecharMenuPerfil(): void {
    this.menuPerfilAberto.set(false);
  }

  logout(): void {
    this.fecharMenuPerfil();
    this.autenticacaoService.encerrarSessao();
    window.location.assign('/');
  }


  // bloco de carregar e reiniciar
  private carregarEstadoOuIniciar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set('');

    this.simulacaoApi.obterEstado().subscribe({
      next: (resposta) => {
        this.aplicarEstado(resposta.estado);
        this.carregando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        if (erro.status === 404) {
          this.iniciarSimulacao();
          return;
        }

        if (erro.status === 401 || erro.status === 422) {
          this.logout();
          return;
        }

        this.erroCarregamento.set(
          erro.error?.error || 'Não foi possível sincronizar a simulação com o backend.',
        );
        this.carregando.set(false);
      },
    });
  }

  private iniciarSimulacao(): void {
    this.carregando.set(true);
    this.erroCarregamento.set('');

    this.simulacaoApi.iniciar().subscribe({
      next: (resposta) => {
        this.carregando.set(false);
        this.aplicarEstado(resposta.estado);
      },
      error: (erro: HttpErrorResponse) => {
        this.carregando.set(false);

        if (erro.status === 401 || erro.status === 422) {
          this.logout();
          return;
        }

        this.erroCarregamento.set(
          erro.error?.error || 'Não foi possível iniciar uma nova simulação.',
        );
      },
    });
  }

  reiniciarSimulacao(): void {
    this.limparBancada();
    this.iniciarSimulacao();
  }

  // bloco do modo apresentacao
  irParaEtapa(etapa: number): void {
    if (!this.modoApresentacao() || this.acaoEmAndamento()) {
      return;
    }

    // relatorio abre a pagina com o progresso real, sem completar os grupos
    if (etapa === 4) {
      this.navegarRelatorioCompleto();
      return;
    }

    this.limparBancada();
    this.acaoEmAndamento.set('ir_para_etapa');

    this.simulacaoApi.irParaEtapa(etapa).subscribe({
      next: (resposta) => {
        this.acaoEmAndamento.set('');
        this.erroCarregamento.set('');
        this.aplicarEstado(resposta.estado);
      },
      error: (erro: HttpErrorResponse) => {
        this.acaoEmAndamento.set('');
        this.erroCarregamento.set(erro.error?.error || 'Não foi possível trocar de etapa.');
      },
    });
  }

  private limparBancada(): void {
    this.fogoAtivo.set(false);
    this.hoverChama.set(false);
    this.tuboX.set(null);
    this.tuboY.set(null);
    this.reagenteSelecionado.set(null);
    this.fecharSimuladorEquipamento();
    this.encerrarEfeitos();
  }

  private aplicarEstado(estado: EstadoSimulacao): void {
    this.estado.set(estado);

    const reagenteAnterior = this.reagenteSelecionado();
    if (reagenteAnterior) {
      const reagenteDisponivel = estado.reagentes_disponiveis.find(
        (item) => item.nome === reagenteAnterior.nome,
      );
      this.reagenteSelecionado.set(reagenteDisponivel ?? null);
    }

    if (!this.reagenteSelecionado() && estado.reagentes_disponiveis.length) {
      this.reagenteSelecionado.set(estado.reagentes_disponiveis[0]);
    }

    if (!estado.teste_chama.ativa) {
      this.fogoAtivo.set(false);
    }
  }


  // bloco dos reagentes
  selecionarReagente(reagente: Reagente): void {
    this.reagenteSelecionado.set(reagente);
  }

  onPainelReagentesDragStart(payload: { event: DragEvent; reagente: Reagente }): void {
    this.onReagentDragStart(payload.event, payload.reagente);
  }

  onReagentDragStart(event: DragEvent, reagente: Reagente): void {
    this.selecionarReagente(reagente);
    event.dataTransfer?.setData('reagente', JSON.stringify(reagente));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onTubeDragOver(event: DragEvent): void {
    event.preventDefault();
    this.hoverTubo.set(true);
  }

  onTubeDragLeave(): void {
    this.hoverTubo.set(false);
  }

  onTubeDrop(event: DragEvent): void {
    event.preventDefault();
    this.hoverTubo.set(false);

    const raw = event.dataTransfer?.getData('reagente');
    if (!raw) {
      return;
    }

    const reagente = JSON.parse(raw) as Reagente;
    this.adicionarReagente(reagente.nome);
  }

  private adicionarReagente(reagente: string): void {
    this.simulacaoApi.aplicarReagente(reagente).subscribe({
      next: (resposta) => {
        this.erroCarregamento.set('');
        this.ativarEfeito('bolhas', 1400);
        this.ativarEfeito('aura', 1400);
        this.aplicarEstado(resposta.estado);
      },
      error: (erro: HttpErrorResponse) => {
        this.erroCarregamento.set(
          erro.error?.error || 'Não foi possível aplicar o reagente selecionado.',
        );
      },
    });
  }


  // bloco das acoes
  acaoDisponivel(nome: string): boolean {
    return this.acoes().some((acao) => acao.nome === nome);
  }

  executarAcao(acao: string): void {
    if (!acao || this.acaoEmAndamento()) {
      return;
    }

    if (
      (acao === AcaoSimulacao.Agitar || acao === AcaoSimulacao.Centrifugar) &&
      !this.acaoDisponivel(acao)
    ) {
      return;
    }

    if (acao === AcaoSimulacao.Agitar || acao === AcaoSimulacao.Centrifugar) {
      this.abrirSimuladorEquipamento(
        acao === AcaoSimulacao.Agitar
          ? EquipamentoSimulacao.Agitador
          : EquipamentoSimulacao.Centrifuga,
      );
      return;
    }

    this.executarAcaoNoServidor(acao);
  }

  private executarAcaoNoServidor(acao: string, fecharModalAoConcluir = false): void {
    this.acaoEmAndamento.set(acao);

    if (acao === AcaoSimulacao.Aquecer) {
      this.fogoAtivo.set(true);
      this.ativarEfeito('fumaca', 2200);
      this.ativarEfeito('aura', 2200);
    }

    this.simulacaoApi.executarAcao(acao).subscribe({
      next: (resposta) => {
        this.erroCarregamento.set('');
        this.acaoEmAndamento.set('');
        if (fecharModalAoConcluir) {
          this.fecharSimuladorEquipamento();
        }
        this.aplicarEstado(resposta.estado);
      },
      error: (erro: HttpErrorResponse) => {
        this.acaoEmAndamento.set('');
        if (fecharModalAoConcluir) {
          this.processamentoEquipamento.set(false);
        }
        this.erroCarregamento.set(
          erro.error?.error || 'Não foi possível executar a ação solicitada.',
        );
      },
    });
  }


  // bloco do teste de chama
  ligarOuDesligarChama(): void {
    if (this.testeChamaAguardandoConfirmacao()) {
      return;
    }

    if (this.estado()?.teste_chama.ativa) {
      this.executarAcao(AcaoSimulacao.DesligarChama);
      return;
    }

    if (this.fogoAtivo()) {
      this.fogoAtivo.set(false);
      return;
    }

    this.fogoAtivo.set(true);
    this.ativarEfeito('fumaca', 1200);
  }

  confirmarTesteChama(): void {
    this.executarAcao(AcaoSimulacao.ConfirmarTesteChama);
  }

  onTubePointerDown(event: MouseEvent): void {
    if ((event.target as HTMLElement)?.closest('.area-soltar-tubo')) {
      return;
    }

    const tubo = event.currentTarget as HTMLElement;
    const rect = tubo.getBoundingClientRect();
    const parentRect = tubo.parentElement?.getBoundingClientRect();

    if (!parentRect) {
      return;
    }

    this.draggingTube = true;
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;

    if (this.tuboX() === null || this.tuboY() === null) {
      this.tuboX.set(rect.left - parentRect.left);
      this.tuboY.set(rect.top - parentRect.top);
    }

    window.addEventListener('mousemove', this.onWindowMouseMove);
    window.addEventListener('mouseup', this.onWindowMouseUp);
  }

  private readonly onWindowMouseMove = (event: MouseEvent): void => {
    if (!this.draggingTube) {
      return;
    }

    const scene = document.querySelector('.cena') as HTMLElement | null;
    if (!scene) {
      return;
    }

    const rect = scene.getBoundingClientRect();
    const tubeWidth = 118;
    const tubeHeight = 300;
    const nextX = Math.max(
      20,
      Math.min(rect.width - tubeWidth - 20, event.clientX - rect.left - this.dragOffsetX),
    );
    const nextY = Math.max(
      120,
      Math.min(rect.height - tubeHeight - 20, event.clientY - rect.top - this.dragOffsetY),
    );

    this.tuboX.set(nextX);
    this.tuboY.set(nextY);
    this.atualizarHoverChama();
  };

  private readonly onWindowMouseUp = (): void => {
    this.draggingTube = false;
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);
    this.verificarAquecimentoPorArraste();
    this.hoverChama.set(false);
  };

  private atualizarHoverChama(): void {
    const tubo = document.querySelector('.tubo-ensaio') as HTMLElement | null;
    const chama = document.querySelector('.alvo-chama') as HTMLElement | null;

    if (!tubo || !chama) {
      this.hoverChama.set(false);
      return;
    }

    const tubeRect = tubo.getBoundingClientRect();
    const flameRect = chama.getBoundingClientRect();
    const intersecta = !(
      tubeRect.right < flameRect.left ||
      tubeRect.left > flameRect.right ||
      tubeRect.bottom < flameRect.top ||
      tubeRect.top > flameRect.bottom
    );

    this.hoverChama.set(intersecta);
  }

  private verificarAquecimentoPorArraste(): void {
    if (
      !this.hoverChama() ||
      !this.acaoDisponivel(AcaoSimulacao.Aquecer) ||
      this.estado()?.teste_chama.ativa ||
      !this.fogoAtivo()
    ) {
      return;
    }

    this.executarAcaoNoServidor(AcaoSimulacao.Aquecer);
  }


  // bloco do agitador e centrifuga
  abrirSimuladorEquipamento(equipamento: EquipamentoSimulacao): void {
    this.simuladorEquipamento.set(equipamento);
    this.tuboNoEquipamento.set(false);
    this.processamentoEquipamento.set(false);
    this.contagemEquipamento.set(equipamento === EquipamentoSimulacao.Centrifuga ? 5 : 3);
    this.limparTimersEquipamento();
  }

  fecharSimuladorEquipamento(): void {
    this.simuladorEquipamento.set(null);
    this.tuboNoEquipamento.set(false);
    this.processamentoEquipamento.set(false);
    this.contagemEquipamento.set(0);
    this.limparTimersEquipamento();
  }

  onEquipmentTubeDragStart(event: DragEvent): void {
    event.dataTransfer?.setData('tube', '1');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  allowEquipmentDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onEquipmentDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.getData('tube') === '1') {
      this.tuboNoEquipamento.set(true);
    }
  }

  iniciarProcessoEquipamento(): void {
    const equipamento = this.simuladorEquipamento();
    if (!equipamento || !this.tuboNoEquipamento() || this.processamentoEquipamento()) {
      return;
    }

    const duracao = equipamento === EquipamentoSimulacao.Centrifuga ? 5 : 3;
    this.processamentoEquipamento.set(true);
    this.contagemEquipamento.set(duracao);
    this.ativarEfeito('aura', duracao * 1000);
    this.ativarEfeito('bolhas', duracao * 1000);

    this.equipamentoInterval = window.setInterval(() => {
      this.contagemEquipamento.update((valor) => Math.max(0, valor - 1));
    }, 1000);

    this.equipamentoTimer = window.setTimeout(() => {
      this.limparTimersEquipamento();
      this.processamentoEquipamento.set(false);
      this.executarAcaoNoServidor(
        equipamento === EquipamentoSimulacao.Centrifuga
          ? AcaoSimulacao.Centrifugar
          : AcaoSimulacao.Agitar,
        true,
      );
    }, duracao * 1000);
  }

  private limparTimersEquipamento(): void {
    if (this.equipamentoTimer) {
      window.clearTimeout(this.equipamentoTimer);
      this.equipamentoTimer = null;
    }

    if (this.equipamentoInterval) {
      window.clearInterval(this.equipamentoInterval);
      this.equipamentoInterval = null;
    }
  }


  // bloco do relatorio
  navegarRelatorioCompleto(): void {
    this.router.navigate(['/relatorio']);
  }

  exportarRelatorioPdf(): void {
    const estado = this.estado();
    if (!estado) {
      return;
    }

    void this.relatorioPdf.exportar(estado);
  }


  // bloco dos efeitos visuais
  private ativarEfeito(tipo: 'bolhas' | 'fumaca' | 'aura', duracaoMs: number): void {
    if (tipo === 'bolhas') {
      this.bolhasAtivas.set(true);
    } else if (tipo === 'fumaca') {
      this.fumacaAtiva.set(true);
    } else {
      this.auraAtiva.set(true);
    }

    const timer = window.setTimeout(() => {
      if (tipo === 'bolhas') {
        this.bolhasAtivas.set(false);
      } else if (tipo === 'fumaca') {
        this.fumacaAtiva.set(false);
      } else {
        this.auraAtiva.set(false);
      }
      this.efeitoTimers = this.efeitoTimers.filter((item) => item !== timer);
    }, duracaoMs);

    this.efeitoTimers.push(timer);
  }

  private encerrarEfeitos(): void {
    this.bolhasAtivas.set(false);
    this.fumacaAtiva.set(false);
    this.auraAtiva.set(false);
    this.limparTimersEfeito();
  }

  private limparTimersEfeito(): void {
    this.efeitoTimers.forEach((timer) => window.clearTimeout(timer));
    this.efeitoTimers = [];
  }


  trackByAcao(index: number, acao: { nome: string }): string {
    return acao.nome;
  }

  trackByEtapa(index: number, etapa: { id: number }): number {
    return etapa.id;
  }

  trackByHistorico(index: number, item: string): string {
    return `${index}-${item}`;
  }
}
