from nucleo.motor_reacoes import aplicar_efeitos, estado_inicial_reacoes, verificar_reacao


def estado_inicial():
    return estado_inicial_reacoes()


def verificar_e_aplicar_reacao(estado, novo_reagente_id):
    return verificar_reacao(estado, novo_reagente_id)
