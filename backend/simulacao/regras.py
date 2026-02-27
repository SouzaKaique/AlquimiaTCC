def aplicar_regras(estado, reagente):
    cation = estado.estado["cation"]

    # Grupo I – HCl
    if reagente == "HCl":
        if cation == "Ag+":
            estado.definir_precipitado("AgCl branco")
            estado.adicionar_evento("Formou precipitado branco de AgCl")

        elif cation == "Pb2+":
            estado.definir_precipitado("PbCl2 branco")
            estado.adicionar_evento("Formou precipitado branco de PbCl2")

        else:
            estado.adicionar_evento("Nenhuma reação observada")