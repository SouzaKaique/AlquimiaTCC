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

import { BenchCardComponent } from './components/bench-card/bench-card.component';
import { BurnerComponent } from './components/burner/burner.component';
import { CentrifugeComponent } from './components/centrifuge/centrifuge.component';
import { DrawerComponent } from './components/drawer/drawer.component';
import { ReagentBoardComponent } from './components/reagent-board/reagent-board.component';
import { StatusBoxComponent } from './components/status-box/status-box.component';
import { TestTubeComponent } from './components/test-tube/test-tube.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { AuthService } from '../../core/services/auth';
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
    BenchCardComponent,
    BurnerComponent,
    CentrifugeComponent,
    DrawerComponent,
    ReagentBoardComponent,
    StatusBoxComponent,
    TestTubeComponent,
    TopbarComponent,
    TextoVisivelPipe,
  ],
  templateUrl: './simulacao.html',
  styleUrls: ['./simulacao.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SimulacaoComponent implements OnInit, OnDestroy {
  // serviços usados para autenticação, comunicação com API, rotas e PDF
  private readonly authService = inject(AuthService);
  private readonly simulacaoApi = inject(SimulacaoApiService);
  private readonly router = inject(Router);
  private readonly relatorioPdf = inject(RelatorioPdfService);

  // estado local da tela e controles visuais da bancada
  readonly estado = signal<EstadoSimulacao | null>(null);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly profileMenuOpen = signal(false);
  readonly hoverTubo = signal(false);
  readonly hoverChama = signal(false);
  readonly fogoAtivo = signal(false);
  readonly acaoEmAndamento = signal('');
  readonly usuarioNome = signal('Usuário');
  readonly reagenteSelecionado = signal<Reagente | null>(null);
  readonly tuboX = signal<number | null>(null);
  readonly tuboY = signal<number | null>(null);
  readonly simuladorEquipamento = signal<EquipamentoSimulacao | null>(null);
  readonly tuboNoEquipamento = signal(false);
  readonly processamentoEquipamento = signal(false);
  readonly contagemEquipamento = signal(0);
  readonly bolhasAtivas = signal(false);
  readonly fumacaAtiva = signal(false);
  readonly auraAtiva = signal(false);
  readonly inicioSessao = Date.now();
  readonly bolhasDecorativas = [0, 1, 2, 3, 4];
  readonly fumacaDecorativa = [0, 1, 2];

  // dados derivados do estado recebido do backend
  readonly etapas = computed(() => this.estado()?.etapas ?? []);
  readonly reagentes = computed(() => this.estado()?.reagentes_disponiveis ?? []);
  readonly acoes = computed(() => this.estado()?.acoes_disponiveis ?? []);
  readonly historico = computed(() => this.estado()?.historico ?? []);
  readonly progresso = computed(() => this.estado()?.progresso ?? 0);
  readonly totalReagentes = computed(() => this.reagentes().length);
  // localiza a etapa atual para preencher titulo, descricao e navegacao
  readonly etapaAtual = computed(() => {
    const etapaId = this.estado()?.etapa_corrente;
    return this.etapas().find((etapa) => etapa.id === etapaId) ?? null;
  });
  // define o visual padrao do tubo quando o backend ainda nao carregou o estado
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
  readonly cena = computed(() => this.estado()?.cena ?? null);
  // mensagem principal exibida na caixa de status da bancada
  readonly mensagemReacao = computed(() => {
    if (this.estado()?.etapa_corrente === 0) {
      return 'Cada grupo começa com uma solução-mãe conhecida. Acompanhe os reagentes, as separações e o progresso da marcha.';
    }

    return this.estado()?.observacao_atual || 'Preparando bancada virtual.';
  });
  readonly resumoFinal = computed(() => this.estado()?.resumo_final ?? []);
  readonly resumoPreview = computed(() => this.resumoFinal().slice(0, 3));
  readonly resumoModal = computed(() => this.resumoFinal().slice(0, 4));
  readonly historicoRecente = computed(() => this.historico().slice(-6));
  readonly ultimaPrecipitacao = computed(() => this.estado()?.ultima_precipitacao ?? null);
  readonly precipitacoes = computed(() => this.estado()?.precipitacoes ?? []);
  readonly testeChamaAguardandoConfirmacao = computed(
    () => this.estado()?.teste_chama.aguardando_confirmacao ?? false,
  );
  // indicadores usados no modal de relatorio final
  readonly gruposConcluidos = computed(
    () => this.etapas().filter((etapa) => etapa.concluida).length,
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
    const minutos = Math.max(1, Math.round((Date.now() - this.inicioSessao) / 60000));
    return `${minutos} min`;
  });
  // remove a acao de aquecer do painel lateral porque ela acontece ao levar o tubo ate a chama
  readonly acoesPainel = computed(() =>
    this.acoes().filter(
      (acao) =>
        acao.nome !== AcaoSimulacao.Aquecer &&
        acao.nome !== AcaoSimulacao.ConfirmarTesteChama,
    ),
  );
  // texto de orientacao do painel de reagentes conforme a etapa da marcha
  readonly destaqueReagentes = computed(() => {
    if (this.estado()?.etapa_corrente === 1) {
      return 'Arraste um sal conhecido para o tubo. Depois leve o tubo até a chama para observar a cor.';
    }

    if (this.estado()?.etapa_corrente === 2 || this.estado()?.etapa_corrente === 3) {
      return 'Use a bandeja, o agitador e a centrífuga para separar as frações da marcha.';
    }

    return 'A bancada exibe aqui os materiais da etapa atual.';
  });
  // indica qual reagente esta selecionado para uso no tubo
  readonly reagenteAtivoTexto = computed(() => {
    const reagente = this.reagenteSelecionado();
    return reagente ? `${reagente.nome} pronto para uso.` : 'Nenhum reagente selecionado.';
  });
  // mensagem exibida no componente do bico de Bunsen
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
  // dica curta exibida quando o usuario arrasta um reagente sobre o tubo
  readonly dicaTubo = computed(() => {
    if (this.hoverTubo()) {
      return 'Solte aqui';
    }

    return '';
  });
  // controla efeitos visuais temporarios do tubo
  readonly mostrarBolhas = computed(
    () => this.bolhasAtivas() || this.visual().turva || this.processamentoEquipamento(),
  );
  readonly mostrarFumaca = computed(
    () => this.fumacaAtiva() || this.estado()?.teste_chama.ativa || this.processamentoEquipamento(),
  );
  readonly mostrarAura = computed(
    () => this.auraAtiva() || this.estado()?.teste_chama.ativa || this.visual().precipitado_ativo,
  );
  // textos do modal de agitador/centrifuga
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
  // posicao manual do tubo quando ele e arrastado pela bancada
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

  // evita recriar botoes de acao sem necessidade durante atualizacoes da tela
  trackByAcao(index: number, acao: { nome: string }): string {
    return acao.nome;
  }

  // evita recriar etapas da topbar quando apenas o estado interno muda
  trackByEtapa(index: number, etapa: { id: number }): number {
    return etapa.id;
  }

  // identifica linhas do historico e resumos usados em listas
  trackByHistorico(index: number, item: string): string {
    return `${index}-${item}`;
  }

  // recebe o arraste iniciado no componente de reagentes e encaminha para o metodo geral
  onReagentBoardDragStart(payload: { event: DragEvent; reagente: Reagente }): void {
    this.onReagentDragStart(payload.event, payload.reagente);
  }

  // variaveis internas usadas durante arraste, timers e efeitos visuais
  private draggingTube = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private equipamentoTimer: number | null = null;
  private equipamentoInterval: number | null = null;
  private efeitoTimers: number[] = [];

  // ao abrir a tela, valida login e tenta carregar a simulacao ativa
  ngOnInit(): void {
    this.usuarioNome.set(localStorage.getItem('usuario_nome') || 'Usuário');

    if (!localStorage.getItem('token')) {
      window.location.assign('/');
      return;
    }

    this.carregarEstadoOuIniciar();
  }

  // ao sair da tela, limpa timers para nao deixar processos rodando
  ngOnDestroy(): void {
    this.limparTimersEquipamento();
    this.limparTimersEfeito();
  }

  // abre ou fecha o menu lateral do perfil
  toggleProfileMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.profileMenuOpen.update((valor) => !valor);
  }

  // fecha o menu lateral do perfil
  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  // encerra a sessao local e volta para o login
  logout(): void {
    this.closeProfileMenu();
    this.authService.encerrarSessao();
    window.location.assign('/');
  }

  // reinicia a marcha limpando efeitos locais e criando novo estado no backend
  reiniciarSimulacao(): void {
    // limpa efeitos e posições locais antes de pedir um novo estado ao backend
    this.fogoAtivo.set(false);
    this.hoverChama.set(false);
    this.tuboX.set(null);
    this.tuboY.set(null);
    this.reagenteSelecionado.set(null);
    this.fecharSimuladorEquipamento();
    this.encerrarEfeitos();
    this.iniciarSimulacao();
  }

  // prepara o calculo de posicao para arrastar o tubo livremente na cena
  onTubePointerDown(event: MouseEvent): void {
    // inicia o arraste manual do tubo pela bancada
    if ((event.target as HTMLElement)?.closest('.tube-drop-zone')) {
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

  // liga, desliga ou encerra o teste de chama quando o usuario clica no bico
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

  // inicia o drag-and-drop de um reagente para o tubo
  onReagentDragStart(event: DragEvent, reagente: Reagente): void {
    this.selecionarReagente(reagente);
    event.dataTransfer?.setData('reagente', JSON.stringify(reagente));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  // permite soltar reagentes sobre o tubo e liga o destaque visual
  onTubeDragOver(event: DragEvent): void {
    event.preventDefault();
    this.hoverTubo.set(true);
  }

  // remove o destaque visual quando o reagente sai da area do tubo
  onTubeDragLeave(): void {
    this.hoverTubo.set(false);
  }

  // recebe o reagente solto no tubo e envia para o backend aplicar a regra
  onTubeDrop(event: DragEvent): void {
    // quando um reagente cai no tubo, apenas o nome é enviado para o backend
    event.preventDefault();
    this.hoverTubo.set(false);

    const raw = event.dataTransfer?.getData('reagente');
    if (!raw) {
      return;
    }

    const reagente = JSON.parse(raw) as Reagente;
    this.adicionarReagente(reagente.nome);
  }

  // guarda o reagente escolhido para destacar no painel e usar no drag-and-drop
  selecionarReagente(reagente: Reagente): void {
    this.reagenteSelecionado.set(reagente);
  }

  // verifica se uma acao esta liberada pelo backend no momento atual
  acaoDisponivel(nome: string): boolean {
    return this.acoes().some((acao) => acao.nome === nome);
  }

  // decide se a acao vai direto para o backend ou precisa abrir o mini-simulador
  executarAcao(acao: string): void {
    // agitação e centrifugação passam pelo mini-simulador antes de chamar a API
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

  // abre o modal de agitador ou centrifuga e prepara a contagem
  abrirSimuladorEquipamento(equipamento: EquipamentoSimulacao): void {
    this.simuladorEquipamento.set(equipamento);
    this.tuboNoEquipamento.set(false);
    this.processamentoEquipamento.set(false);
    this.contagemEquipamento.set(equipamento === EquipamentoSimulacao.Centrifuga ? 5 : 3);
    this.limparTimersEquipamento();
  }

  // fecha o modal de equipamento e limpa estados temporarios
  fecharSimuladorEquipamento(): void {
    this.simuladorEquipamento.set(null);
    this.tuboNoEquipamento.set(false);
    this.processamentoEquipamento.set(false);
    this.contagemEquipamento.set(0);
    this.limparTimersEquipamento();
  }

  // navega para a pagina de relatorio completo
  navegarRelatorioCompleto(): void {
    this.router.navigate(['/relatorio']);
  }

  // exporta o estado atual da marcha para PDF
  exportarRelatorioPdf(): void {
    const estado = this.estado();
    if (!estado) {
      return;
    }

    void this.relatorioPdf.exportar(estado);
  }

  // confirma que o aluno já visualizou a última cor do teste de chama
  confirmarTesteChama(): void {
    this.executarAcao(AcaoSimulacao.ConfirmarTesteChama);
  }

  // inicia o arraste do tubo para dentro do agitador ou da centrifuga
  onEquipmentTubeDragStart(event: DragEvent): void {
    event.dataTransfer?.setData('tube', '1');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  // permite soltar o tubo dentro do equipamento
  allowEquipmentDrop(event: DragEvent): void {
    event.preventDefault();
  }

  // confirma que o tubo foi colocado no equipamento
  onEquipmentDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.getData('tube') === '1') {
      this.tuboNoEquipamento.set(true);
    }
  }

  // simula o tempo do equipamento e depois confirma a acao no backend
  iniciarProcessoEquipamento(): void {
    // simula o tempo do equipamento e só depois confirma a ação no backend
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

  // carrega a simulacao ativa ou cria uma nova quando nenhuma existe
  private carregarEstadoOuIniciar(): void {
    // tenta restaurar a simulação ativa; se não existir, inicia uma nova
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

  // solicita ao backend uma nova simulacao do zero
  private iniciarSimulacao(): void {
    // cria uma marcha limpa no backend e sincroniza a tela
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

  // envia o reagente para o backend e atualiza a interface com o novo estado
  private adicionarReagente(reagente: string): void {
    // aplica o reagente e ativa um feedback visual curto no tubo
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

  // executa acoes da marcha no backend, como aquecer, agitar e centrifugar
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

  // recebe o estado novo do backend e sincroniza selecao, chama e dados da tela
  private aplicarEstado(estado: EstadoSimulacao): void {
    // mantém a seleção visual sincronizada com os reagentes liberados pelo backend
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

  // atualiza a posicao do tubo enquanto o usuario arrasta pela bancada
  private readonly onWindowMouseMove = (event: MouseEvent): void => {
    if (!this.draggingTube) {
      return;
    }

    const scene = document.querySelector('.scene') as HTMLElement | null;
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

  // finaliza o arraste do tubo e verifica se deve aquecer a amostra
  private readonly onWindowMouseUp = (): void => {
    this.draggingTube = false;
    window.removeEventListener('mousemove', this.onWindowMouseMove);
    window.removeEventListener('mouseup', this.onWindowMouseUp);
    this.verificarAquecimentoPorArraste();
    this.hoverChama.set(false);
  };

  // cancela timers do modal de agitador/centrifuga
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

  // detecta se o tubo esta tocando a area ativa da chama
  private atualizarHoverChama(): void {
    // verifica se o tubo está sobre a região ativa da chama
    const tubo = document.querySelector('.test-tube') as HTMLElement | null;
    const chama = document.querySelector('.burner-drop-target') as HTMLElement | null;

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

  // chama o backend para aquecer somente se o tubo foi levado ate a chama acesa
  private verificarAquecimentoPorArraste(): void {
    // envia o aquecimento ao backend somente quando o tubo foi levado até a chama
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

  // ativa efeitos temporarios de bolhas, fumaca ou aura no tubo
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

  // desliga todos os efeitos visuais do tubo
  private encerrarEfeitos(): void {
    this.bolhasAtivas.set(false);
    this.fumacaAtiva.set(false);
    this.auraAtiva.set(false);
    this.limparTimersEfeito();
  }

  // limpa timers dos efeitos visuais para evitar acumulo
  private limparTimersEfeito(): void {
    this.efeitoTimers.forEach((timer) => window.clearTimeout(timer));
    this.efeitoTimers = [];
  }
}
