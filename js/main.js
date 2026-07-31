// =====================================================
// MAIN - Inicialização da aplicação
// =====================================================

import { getMesas } from "./api.js";
import { atualizarMesas, definirCoordenadas } from "./mapa.js";
import { iniciarReserva } from "./reserva.js";
import { iniciarPagamento } from "./pagamento.js";

// =====================================================
// Carregar coordenadas do mapa
// =====================================================
async function carregarCoordenadas() {
    const resposta = await fetch("data/mesaCoordenadas.json");
    const dados = await resposta.json();
    definirCoordenadas(dados);
}

// =====================================================
// Carregar mesas da API (Exportado para uso em outros módulos)
// =====================================================
export async function carregarMesas() {
    try {
        const mesas = await getMesas();
        atualizarMesas(mesas);
    } catch(erro) {
        console.error("Erro ao carregar mesas:", erro);
    }
}

// =====================================================
// Botão mostrar mapa impresso
// =====================================================
function configurarMapaImagem() {
    const botao = document.getElementById("btnToggleMapa");
    const wrapper = document.getElementById("mapaImagemWrapper");

    botao.addEventListener("click", () => {
        const oculto = wrapper.classList.contains("oculto");
        if (oculto) {
            wrapper.classList.remove("oculto");
            botao.textContent = "Ocultar mapa impresso";
        } else {
            wrapper.classList.add("oculto");
            botao.textContent = "Ver mapa impresso";
        }
    });
}

// =====================================================
// 7. Botão manual de atualizar
// =====================================================
function configurarBotaoAtualizar() {
    const btnAtualizar = document.getElementById("btnAtualizarMapa");
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", async () => {
            btnAtualizar.disabled = true;
            btnAtualizar.textContent = "Atualizando...";
            await carregarMesas();
            btnAtualizar.disabled = false;
            btnAtualizar.textContent = "🔄 Atualizar Mapa";
        });
    }
}

// =====================================================
// 5. Verificar retorno do pagamento (Mercado Pago)
// =====================================================
async function verificarRetornoPagamento() {
    const params = new URLSearchParams(window.location.search);
    const pagamento = params.get("pagamento");
    if (!pagamento) return;

    const mesasParam = params.get("mesas") || "";
    const mesas = mesasParam.split(",").filter(Boolean);
    const listaMesas = mesas.length ? "Mesa" + (mesas.length > 1 ? "s " : " ") + mesas.join(", ") : "Suas mesas";

    let mensagem = "";
    if (pagamento === "ok") {
        mensagem = listaMesas + " compradas com sucesso! Em instantes a informação será atualizada no mapa.";
    } else if (pagamento === "pendente") {
        mensagem = listaMesas + ": pagamento pendente de confirmação. Assim que for aprovado, o mapa será atualizado automaticamente.";
    } else {
        mensagem = listaMesas + ": não foi possível confirmar o pagamento. Tente novamente ou entre em contato conosco.";
    }

    alert(mensagem);

    // Limpa os parâmetros da URL para não repetir o alerta
    const urlLimpa = window.location.origin + window.location.pathname;
    window.history.replaceState({}, "", urlLimpa);
    
    // Atualiza o mapa após o retorno do pagamento
    await carregarMesas();
}

// =====================================================
// 2. Controle de visibilidade da aba (foco/retorno)
// =====================================================
function configurarAtualizacaoPorVisibilidade() {
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            carregarMesas();
        }
    });
    
    window.addEventListener("focus", () => {
        carregarMesas();
    });
}

// =====================================================
// Inicialização
// =====================================================
async function iniciarAplicacao() {
    // 1. Carregamento inicial da página
    await carregarCoordenadas();
    await carregarMesas();
    
    configurarMapaImagem();
    configurarBotaoAtualizar();
    configurarAtualizacaoPorVisibilidade();
    
    await verificarRetornoPagamento();
    
    // Passa a função de refresh para o módulo de reserva
    iniciarReserva(carregarMesas);
    iniciarPagamento();
}

iniciarAplicacao();
