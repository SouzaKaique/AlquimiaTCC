import unittest

from app import create_app
from extensions import db
from models import Historico


class ContratosApiTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
                "JWT_SECRET_KEY": "segredo-de-teste-com-tamanho-minimo-adequado",
            }
        )

        self.contexto = self.app.app_context()
        self.contexto.push()
        db.create_all()
        self.cliente = self.app.test_client()

    def tearDown(self) -> None:
        db.session.remove()
        db.drop_all()
        self.contexto.pop()

    def autenticar(self) -> dict[str, str]:
        cadastro = self.cliente.post(
            "/auth/register",
            json={"nome": "usuario-teste", "senha": "senha-segura"},
        )
        self.assertEqual(cadastro.status_code, 201)

        login = self.cliente.post(
            "/auth/login",
            json={"nome": "usuario-teste", "senha": "senha-segura"},
        )
        self.assertEqual(login.status_code, 200)

        token = login.get_json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_saude(self) -> None:
        resposta = self.cliente.get("/saude")

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.get_json()["status"], "ok")

    def test_cors_aceita_porta_alternativa_do_frontend(self) -> None:
        resposta = self.cliente.options(
            "/saude",
            headers={
                "Origin": "http://localhost:4201",
                "Access-Control-Request-Method": "GET",
            },
        )

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(
            resposta.headers.get("Access-Control-Allow-Origin"),
            "http://localhost:4201",
        )

    def test_fluxo_principal_da_simulacao(self) -> None:
        headers = self.autenticar()

        inicio = self.cliente.post("/simulacao/iniciar", headers=headers)
        self.assertEqual(inicio.status_code, 201)
        self.assertIn("estado", inicio.get_json())

        estado = self.cliente.get("/simulacao/estado", headers=headers)
        self.assertEqual(estado.status_code, 200)

        acao = self.cliente.post(
            "/simulacao/acao",
            headers=headers,
            json={"acao": "iniciar_roteiro"},
        )
        self.assertEqual(acao.status_code, 200)
        self.assertEqual(Historico.query.count(), 1)

        historico = Historico.query.first()
        self.assertEqual(historico.reagente1_id, 0)
        self.assertEqual(historico.reagente2_id, 0)

    def test_teste_de_chama_aguarda_confirmacao_antes_do_grupo_2(self) -> None:
        headers = self.autenticar()

        self.cliente.post("/simulacao/iniciar", headers=headers)
        self.cliente.post(
            "/simulacao/acao",
            headers=headers,
            json={"acao": "iniciar_roteiro"},
        )

        for sal in ("Sal de potassio", "Sal de sodio", "Sal de estroncio"):
            self.cliente.post(
                "/simulacao/reagente",
                headers=headers,
                json={"reagente": sal},
            )
            resposta = self.cliente.post(
                "/simulacao/acao",
                headers=headers,
                json={"acao": "aquecer"},
            )

        estado = resposta.get_json()["estado"]
        self.assertEqual(estado["etapa_corrente"], 1)
        self.assertTrue(estado["teste_chama"]["ativa"])
        self.assertTrue(estado["teste_chama"]["aguardando_confirmacao"])
        self.assertIn("vermelha", estado["teste_chama"]["mensagem"])

        confirmacao = self.cliente.post(
            "/simulacao/acao",
            headers=headers,
            json={"acao": "confirmar_teste_chama"},
        )
        estado_confirmado = confirmacao.get_json()["estado"]
        self.assertEqual(estado_confirmado["etapa_corrente"], 2)
        self.assertFalse(estado_confirmado["teste_chama"]["ativa"])

    def test_modo_apresentacao_pula_para_o_grupo_3(self) -> None:
        self.app.config["USUARIOS_APRESENTACAO"] = {"usuario-teste"}
        headers = self.autenticar()

        resposta = self.cliente.post("/simulacao/etapa", headers=headers, json={"etapa": 3})
        self.assertEqual(resposta.status_code, 200)

        estado = resposta.get_json()["estado"]
        self.assertEqual(estado["etapa_corrente"], 3)
        self.assertEqual(estado["progresso"], 67)
        self.assertEqual([r["nome"] for r in estado["reagentes_disponiveis"]], ["NH4Cl"])

        relatorio = self.cliente.post("/simulacao/etapa", headers=headers, json={"etapa": 4})
        self.assertEqual(relatorio.get_json()["estado"]["progresso"], 100)

    def test_modo_apresentacao_bloqueia_usuario_comum(self) -> None:
        headers = self.autenticar()

        resposta = self.cliente.post("/simulacao/etapa", headers=headers, json={"etapa": 2})

        self.assertEqual(resposta.status_code, 403)

    def test_rotas_protegidas_rejeitam_requisicao_sem_token(self) -> None:
        resposta = self.cliente.get("/simulacao/estado")

        self.assertEqual(resposta.status_code, 401)


if __name__ == "__main__":
    unittest.main()
