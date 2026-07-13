export interface CenaCard {
  titulo: string;
  subtitulo?: string;
  conteudo: string;
}

export interface Cena {
  solucao_mae: CenaCard;
  tubo: CenaCard;
  precipitado: CenaCard | null;
  sobrenadante: CenaCard | null;
  equipamentos: {
    bico: boolean;
    agitador: boolean;
    centrifuga: boolean;
  };
}
