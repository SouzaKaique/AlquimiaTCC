def aplicar_regras(estado, reagente):
    cation = estado.estado["cation"]

    # Registrar reagente
    estado.adicionar_reagente(reagente)

    # Grupo I – HCl
    if reagente == "HCl":

        if cation == "Ag+":
            estado.definir_precipitado("AgCl branco")

        elif cation == "Pb2+":
            estado.definir_precipitado("PbCl2 branco")

        else:
            estado.adicionar_evento("Nenhuma reação observada")

    # Exemplo adicional (expansão futura)
    elif reagente == "NaOH":

        if cation == "Fe3+":
            estado.definir_precipitado("Fe(OH)3 marrom")
            estado.alterar_cor("marrom")

        else:
            estado.adicionar_evento("Nenhuma reação com NaOH")

    else:
        estado.adicionar_evento("Reagente sem regra definida")