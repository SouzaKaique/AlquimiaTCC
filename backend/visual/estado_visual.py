# bloco da cena da bancada
def atualizar_cena(estado: dict) -> None:
    etapa = estado["etapa_corrente"]

    if etapa == 0:
        estado["cena"] = {
            "solucao_mae": {
                "titulo": "Roteiro por grupos",
                "subtitulo": "Cada pratica ja comeca com uma solucao-mae conhecida.",
                "conteudo": "Grupo 1: sais para teste de chama. Grupo 2: Mg2+, Ca2+ e Ba2+. Grupo 3: Fe3+, Al3+ e Ni2+.",
            },
            "tubo": {
                "titulo": "Bancada preparada",
                "conteudo": "Use o botao iniciar para abrir o primeiro roteiro da marcha.",
            },
            "precipitado": None,
            "sobrenadante": None,
            "equipamentos": {"bico": False, "agitador": False, "centrifuga": False},
        }
        return

    if etapa == 1:
        amostra = estado["grupo1"]["amostra_atual"]
        testadas = ", ".join(estado["grupo1"]["testadas"]) or "Nenhuma ainda."
        estado["cena"] = {
            "solucao_mae": {
                "titulo": "Grupo 1 - sais conhecidos",
                "subtitulo": "Potassio, sodio e estroncio para teste de chama.",
                "conteudo": f"Amostras ja observadas: {testadas}",
            },
            "tubo": {
                "titulo": "Tubo de ensaio",
                "conteudo": (
                    f"Amostra atual: {amostra}. Aguarda aquecimento."
                    if amostra
                    else "Arraste um sal conhecido para o tubo."
                ),
            },
            "precipitado": None,
            "sobrenadante": None,
            "equipamentos": {"bico": True, "agitador": False, "centrifuga": False},
        }
        return

    if etapa == 2:
        grupo2 = estado["grupo2"]
        precipitado = None
        sobrenadante = None

        if grupo2["magnesio_separado"]:
            precipitado = {
                "titulo": "Precipitado isolado",
                "conteudo": "Mg2+ separado como precipitado branco.",
            }
            sobrenadante = {
                "titulo": "Sobrenadante atual",
                "conteudo": "Contem Ca2+ e Ba2+ para a proxima etapa da marcha.",
            }

        if grupo2["carbonatos_separados"]:
            precipitado = {
                "titulo": "Precipitado final",
                "conteudo": "Carbonatos brancos de Ca2+ e Ba2+ separados ao final do grupo 2.",
            }
            sobrenadante = {
                "titulo": "Sobrenadante final",
                "conteudo": "Restou apenas a fase liquida apos a separacao do grupo 2.",
            }

        estado["cena"] = {
            "solucao_mae": {
                "titulo": "Solucao-mae do grupo 2",
                "subtitulo": "Mg2+, Ca2+ e Ba2+ em mistura conhecida.",
                "conteudo": "A separacao acontece por reagente seletivo, agitacao e centrifugacao.",
            },
            "tubo": {
                "titulo": "Tubo / mistura em trabalho",
                "conteudo": estado["observacao_atual"],
            },
            "precipitado": precipitado,
            "sobrenadante": sobrenadante,
            "equipamentos": {"bico": False, "agitador": True, "centrifuga": True},
        }
        return

    if etapa == 3:
        grupo3 = estado["grupo3"]
        precipitado = None
        sobrenadante = None

        if grupo3["hidroxidos_separados"]:
            precipitado = {
                "titulo": "Precipitado de hidroxidos",
                "conteudo": "Fe3+ e Al3+ ficaram retidos na fase solida.",
            }
            sobrenadante = {
                "titulo": "Sobrenadante do grupo 3",
                "conteudo": "Segue para confirmacao de Ni2+ com dimetilglioxima.",
            }

        if grupo3["ni_confirmado"]:
            precipitado = {
                "titulo": "Precipitado final",
                "conteudo": "Ni2+ confirmado por precipitado vermelho com DMG.",
            }
            sobrenadante = {
                "titulo": "Sobrenadante final",
                "conteudo": "A fracao liquida foi esgotada apos a confirmacao do Ni2+.",
            }

        estado["cena"] = {
            "solucao_mae": {
                "titulo": "Solucao-mae do grupo 3",
                "subtitulo": "Fe3+, Al3+ e Ni2+ em mistura conhecida.",
                "conteudo": "A pratica mostra separacao de hidroxidos e confirmacao seletiva no sobrenadante.",
            },
            "tubo": {
                "titulo": "Tubo / mistura em trabalho",
                "conteudo": estado["observacao_atual"],
            },
            "precipitado": precipitado,
            "sobrenadante": sobrenadante,
            "equipamentos": {"bico": False, "agitador": True, "centrifuga": True},
        }
        return

    estado["cena"] = {
        "solucao_mae": {
            "titulo": "Relatorio final",
            "subtitulo": "Resumo das observacoes da marcha por grupos.",
            "conteudo": "Revise as separacoes e use o historico para consolidar o estudo.",
        },
        "tubo": {
            "titulo": "Roteiro concluido",
            "conteudo": "A bancada foi usada para demonstrar separacao de grupos conhecidos.",
        },
        "precipitado": None,
        "sobrenadante": None,
        "equipamentos": {"bico": False, "agitador": False, "centrifuga": False},
    }


# bloco do visual do tubo
def aplicar_visual(
    estado: dict,
    *,
    cor_solucao: str,
    turva: bool,
    precipitado: bool,
    precipitado_cor: str,
    nivel: int,
) -> None:
    estado["visual"] = {
        "nivel": nivel,
        "cor_solucao": cor_solucao,
        "gradiente": criar_gradiente(cor_solucao),
        "turva": turva,
        "precipitado_ativo": precipitado,
        "precipitado_cor": precipitado_cor,
    }


def criar_gradiente(cor_base: str) -> str:
    clara = ajustar_cor(cor_base, 24)
    escura = ajustar_cor(cor_base, -24)
    return f"linear-gradient(180deg, {clara} 0%, {cor_base} 55%, {escura} 100%)"


def ajustar_cor(hex_color: str, amount: int) -> str:
    color = hex_color.replace("#", "")
    number = int(color, 16)
    red = max(0, min(255, (number >> 16) + amount))
    green = max(0, min(255, ((number >> 8) & 0xFF) + amount))
    blue = max(0, min(255, (number & 0xFF) + amount))
    return f"#{((red << 16) | (green << 8) | blue):06x}"
