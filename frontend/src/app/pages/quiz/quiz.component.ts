import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../core/services/auth';
import { DrawerComponent } from '../simulacao/components/drawer/drawer.component';
import { TopbarComponent } from '../simulacao/components/topbar/topbar.component';

interface AlternativaQuiz {
  texto: string;
  correta: boolean;
}

interface PerguntaQuiz {
  categoria: string;
  enunciado: string;
  explicacao: string;
  alternativas: AlternativaQuiz[];
}

const PERGUNTAS_QUIZ: PerguntaQuiz[] = [
  {
    categoria: 'Marcha Analítica',
    enunciado: 'Qual é o objetivo principal da marcha analítica de cátions?',
    explicacao: 'A marcha separa íons em grupos por reações seletivas, facilitando a identificação.',
    alternativas: [
      { texto: 'Medir apenas a temperatura da solução', correta: false },
      { texto: 'Separar e identificar íons por grupos químicos', correta: true },
      { texto: 'Determinar a massa molar da água', correta: false },
      { texto: 'Neutralizar qualquer ácido automaticamente', correta: false },
    ],
  },
  {
    categoria: 'Química Geral',
    enunciado: 'O que indica a formação de um precipitado?',
    explicacao: 'Precipitado é um sólido formado quando produtos pouco solúveis surgem na solução.',
    alternativas: [
      { texto: 'A evaporação total do solvente', correta: false },
      { texto: 'A ausência de reação química', correta: false },
      { texto: 'A formação de uma fase sólida pouco solúvel', correta: true },
      { texto: 'Apenas uma mudança de temperatura', correta: false },
    ],
  },
  {
    categoria: 'Reações',
    enunciado: 'Em uma reação de precipitação, qual fator é decisivo?',
    explicacao: 'A baixa solubilidade do produto favorece a separação como sólido.',
    alternativas: [
      { texto: 'A cor do frasco utilizado', correta: false },
      { texto: 'A altura da bancada', correta: false },
      { texto: 'A velocidade de escrita no relatório', correta: false },
      { texto: 'A solubilidade do produto formado', correta: true },
    ],
  },
  {
    categoria: 'Íons',
    enunciado: 'Qual espécie representa corretamente um cátion?',
    explicacao: 'Cátions possuem carga positiva, como o cálcio em Ca²+.',
    alternativas: [
      { texto: 'Ca²+', correta: true },
      { texto: 'Cl-', correta: false },
      { texto: 'SO4²-', correta: false },
      { texto: 'OH-', correta: false },
    ],
  },
  {
    categoria: 'Vidrarias',
    enunciado: 'Qual vidraria é mais associada à observação de pequenas reações qualitativas?',
    explicacao: 'O tubo de ensaio permite observar pequenas quantidades de solução e precipitado.',
    alternativas: [
      { texto: 'Bureta volumétrica', correta: false },
      { texto: 'Tubo de ensaio', correta: true },
      { texto: 'Dessecador', correta: false },
      { texto: 'Proveta de descarte', correta: false },
    ],
  },
  {
    categoria: 'Laboratório',
    enunciado: 'Por que a agitação é importante em algumas etapas?',
    explicacao: 'Agitar ajuda o reagente a entrar em contato com toda a solução.',
    alternativas: [
      { texto: 'Para substituir a centrifugação em qualquer caso', correta: false },
      { texto: 'Para eliminar todos os íons da solução', correta: false },
      { texto: 'Para homogeneizar a mistura e favorecer o contato entre reagentes', correta: true },
      { texto: 'Para impedir qualquer precipitação', correta: false },
    ],
  },
  {
    categoria: 'Segurança',
    enunciado: 'Qual prática é adequada ao aquecer uma amostra em tubo?',
    explicacao: 'A boca do tubo não deve apontar para pessoas durante aquecimento.',
    alternativas: [
      { texto: 'Tampar completamente o tubo durante o aquecimento', correta: false },
      { texto: 'Segurar o tubo diretamente pela chama', correta: false },
      { texto: 'Aquecer sem observar a amostra', correta: false },
      { texto: 'Manter a abertura do tubo voltada para longe das pessoas', correta: true },
    ],
  },
  {
    categoria: 'Separação de grupos',
    enunciado: 'O que a centrifugação auxilia a separar?',
    explicacao: 'A centrífuga acelera a separação entre sólido precipitado e sobrenadante.',
    alternativas: [
      { texto: 'Somente gases nobres', correta: false },
      { texto: 'Precipitado e sobrenadante', correta: true },
      { texto: 'Apenas a cor da chama', correta: false },
      { texto: 'A massa do béquer', correta: false },
    ],
  },
  {
    categoria: 'Teste de chama',
    enunciado: 'O teste de chama é útil porque alguns íons:',
    explicacao: 'Certos cátions emitem cores características quando excitados pela chama.',
    alternativas: [
      { texto: 'Sempre ficam invisíveis na chama', correta: false },
      { texto: 'Transformam água em ácido forte', correta: false },
      { texto: 'Emitem cores características ao serem aquecidos', correta: true },
      { texto: 'Impedem qualquer emissão luminosa', correta: false },
    ],
  },
  {
    categoria: 'Precipitação',
    enunciado: 'O sobrenadante é:',
    explicacao: 'Após separação, o sobrenadante é a fase líquida acima do sólido.',
    alternativas: [
      { texto: 'O sólido depositado no fundo', correta: false },
      { texto: 'A chama do bico de Bunsen', correta: false },
      { texto: 'Uma vidraria de aquecimento', correta: false },
      { texto: 'A fase líquida que permanece acima do precipitado', correta: true },
    ],
  },
  {
    categoria: 'Reagentes',
    enunciado: 'Por que reagentes seletivos são usados na marcha?',
    explicacao: 'A seletividade permite reagir com grupos específicos de íons.',
    alternativas: [
      { texto: 'Para favorecer reações com grupos específicos', correta: true },
      { texto: 'Para colorir todos os líquidos da mesma forma', correta: false },
      { texto: 'Para evitar qualquer evidência visual', correta: false },
      { texto: 'Para substituir o registro de observações', correta: false },
    ],
  },
  {
    categoria: 'Observação',
    enunciado: 'Qual registro é mais útil em uma análise qualitativa?',
    explicacao: 'Cor, precipitado, turbidez e mudanças visíveis sustentam a conclusão.',
    alternativas: [
      { texto: 'Apenas o horário de abertura do software', correta: false },
      { texto: 'Mudanças de cor, formação de precipitado e comportamento da solução', correta: true },
      { texto: 'Somente o nome do usuário', correta: false },
      { texto: 'A cor do menu lateral', correta: false },
    ],
  },
  {
    categoria: 'Íons',
    enunciado: 'O íon Ni²+ é um exemplo de:',
    explicacao: 'Ni²+ é um cátion metálico usado em análises qualitativas.',
    alternativas: [
      { texto: 'Ânion haleto', correta: false },
      { texto: 'Molécula apolar neutra', correta: false },
      { texto: 'Cátion metálico', correta: true },
      { texto: 'Indicador ácido-base universal', correta: false },
    ],
  },
  {
    categoria: 'Laboratório',
    enunciado: 'Qual atitude melhora a confiabilidade da análise?',
    explicacao: 'Seguir a sequência e registrar evidências reduz interpretações erradas.',
    alternativas: [
      { texto: 'Pular etapas sem justificativa', correta: false },
      { texto: 'Misturar todos os reagentes ao mesmo tempo', correta: false },
      { texto: 'Ignorar precipitados formados', correta: false },
      { texto: 'Seguir a sequência, observar evidências e registrar resultados', correta: true },
    ],
  },
  {
    categoria: 'Conclusão',
    enunciado: 'Uma conclusão bem construída deve relacionar:',
    explicacao: 'O resultado final precisa conectar evidências observadas com os íons identificados.',
    alternativas: [
      { texto: 'Somente a aparência do botão clicado', correta: false },
      { texto: 'Evidências observadas e identificação dos íons', correta: true },
      { texto: 'A largura da tela e o nome do navegador', correta: false },
      { texto: 'A quantidade de animações da interface', correta: false },
    ],
  },
];

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, DrawerComponent, TopbarComponent],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizComponent {
  private readonly authService = inject(AuthService);

  readonly perguntas = PERGUNTAS_QUIZ;
  readonly profileMenuOpen = signal(false);
  readonly usuarioNome = signal(localStorage.getItem('usuario_nome') || 'Usuário');
  readonly iniciado = signal(false);
  readonly finalizado = signal(false);
  readonly indiceAtual = signal(0);
  readonly alternativaSelecionada = signal<number | null>(null);
  readonly respostas = signal<boolean[]>([]);

  readonly perguntaAtual = computed(() => this.perguntas[this.indiceAtual()]);
  readonly pontuacao = computed(() => this.respostas().filter(Boolean).length);
  readonly progresso = computed(() => Math.round((this.respostas().length / this.perguntas.length) * 100));
  readonly acertouAtual = computed(() => {
    const indice = this.alternativaSelecionada();
    return indice === null ? null : this.perguntaAtual().alternativas[indice]?.correta ?? false;
  });
  readonly desempenho = computed(() => Math.round((this.pontuacao() / this.perguntas.length) * 100));

  constructor(private readonly router: Router) {}

  toggleProfileMenu(event?: MouseEvent): void {
    event?.stopPropagation();
    this.profileMenuOpen.update((valor) => !valor);
  }

  closeProfileMenu(): void {
    this.profileMenuOpen.set(false);
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.encerrarSessao();
    window.location.assign('/');
  }

  iniciar(): void {
    this.iniciado.set(true);
    this.finalizado.set(false);
    this.indiceAtual.set(0);
    this.alternativaSelecionada.set(null);
    this.respostas.set([]);
  }

  responder(indice: number): void {
    if (this.alternativaSelecionada() !== null) {
      return;
    }

    const correta = this.perguntaAtual().alternativas[indice]?.correta ?? false;
    this.alternativaSelecionada.set(indice);
    this.respostas.update((respostas) => [...respostas, correta]);
  }

  proxima(): void {
    if (this.indiceAtual() >= this.perguntas.length - 1) {
      this.finalizado.set(true);
      return;
    }

    this.indiceAtual.update((indice) => indice + 1);
    this.alternativaSelecionada.set(null);
  }

  refazer(): void {
    this.iniciar();
  }

  voltarLaboratorio(): void {
    this.router.navigate(['/simulacao']);
  }

  trackByAlternativa(index: number): number {
    return index;
  }
}
