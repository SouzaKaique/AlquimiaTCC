from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Usuario
from routes.auth import eh_apresentador
from servicos.servico_simulacao import ServicoSimulacao

bp = Blueprint("simulacao", __name__)
servico_simulacao = ServicoSimulacao()


# bloco iniciar simulacao
@bp.route("/iniciar", methods=["POST"])
@jwt_required()
def iniciar_simulacao():
    user_id = int(get_jwt_identity())

    return jsonify(servico_simulacao.iniciar(user_id)), 201


# bloco estado da simulacao
@bp.route("/estado", methods=["GET"])
@jwt_required()
def ver_estado():
    resposta = servico_simulacao.obter_estado(int(get_jwt_identity()))

    if not resposta:
        return jsonify({"error": "Nenhuma simulacao ativa."}), 404

    return jsonify(resposta), 200


# bloco reagente
@bp.route("/reagente", methods=["POST"])
@jwt_required()
def aplicar_reagente():
    data = request.get_json(silent=True) or {}
    reagente = (data.get("reagente") or "").strip()

    if not reagente:
        return jsonify({"error": "Reagente nao informado."}), 400

    resposta = servico_simulacao.aplicar_reagente(int(get_jwt_identity()), reagente)

    if not resposta:
        return jsonify({"error": "Nenhuma simulacao ativa."}), 404

    return jsonify(resposta), 200


# bloco acoes
@bp.route("/aquecer", methods=["POST"])
@jwt_required()
def aquecer():
    return _executar_acao("aquecer", "Aquecimento executado na etapa atual.")


@bp.route("/acao", methods=["POST"])
@jwt_required()
def executar_acao():
    data = request.get_json(silent=True) or {}
    acao = (data.get("acao") or "").strip()

    if not acao:
        return jsonify({"error": "Acao nao informada."}), 400

    return _executar_acao(acao, f"Acao executada: {acao}.")


def _executar_acao(acao: str, descricao_historico: str):
    resposta = servico_simulacao.executar_acao(
        usuario_id=int(get_jwt_identity()),
        acao=acao,
        descricao_historico=descricao_historico,
    )

    if not resposta:
        return jsonify({"error": "Nenhuma simulacao ativa."}), 404

    return jsonify(resposta), 200


# bloco modo apresentacao
@bp.route("/etapa", methods=["POST"])
@jwt_required()
def ir_para_etapa():
    usuario = db.session.get(Usuario, int(get_jwt_identity()))
    if not eh_apresentador(usuario):
        return jsonify({"error": "Acesso restrito ao modo apresentacao."}), 403

    data = request.get_json(silent=True) or {}
    etapa = data.get("etapa")

    if not isinstance(etapa, int) or etapa not in (0, 1, 2, 3, 4):
        return jsonify({"error": "Etapa invalida."}), 400

    return jsonify(servico_simulacao.ir_para_etapa(usuario.id, etapa)), 200


# bloco finalizar
@bp.route("/finalizar", methods=["POST"])
@jwt_required()
def finalizar_simulacao():
    finalizada = servico_simulacao.finalizar(int(get_jwt_identity()))

    if not finalizada:
        return jsonify({"error": "Nenhuma simulacao ativa."}), 404

    return jsonify({"mensagem": "Simulacao finalizada."}), 200
