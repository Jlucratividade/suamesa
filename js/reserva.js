// =====================================================
// RESERVAS
// Controle do fluxo de reserva das mesas
// =====================================================
import { validarFormulario } from "./validacao.js";
import { reservarMesas, cancelarReserva } from "./api.js";
import { selecionadas, atualizarResumo, mesasState } from "./mapa.js";

export let reservaAtual = null;
let refreshMapaCallback = null;

// =====================================================
// Inicializa botão reservar
// =====================================================
export function iniciarReserva(callbackRefresh) {
    refreshMapaCallback = callbackRefresh;

    const btn = document.getElementById("btnReservar");
    btn.addEventListener("click", executarReserva);

    const btnVoltar = document.getElementById("btnVoltarHome");
    if (btnVoltar) {
        btnVoltar.addEventListener("click", voltarParaHome);
    }
}

// =====================================================
// Função auxiliar para atualizar o mapa sob demanda
// =====================================================
async function refreshMapa() {
    if (refreshMapaCallback) {
        await refreshMapaCallback();
    }
}

// =====================================================
// Executa reserva
// =====================================================
async function executarReserva() {
    const nome = document.getElementById("nome").value.trim();
    const contato = document.getElementById("contato").value.trim();
    const status = document.getElementById("status-msg");

    if (!validarFormulario()) {
        status.textContent = "Corrija os dados antes de continuar.";
        return;
    }

    const btn = document.getElementById("btnReservar");
    btn.disabled = true;
    btn.textContent = "Verificando disponibilidade...";
    status.textContent = "";

    // 3. Imediatamente antes de o usuário tentar reservar
    await refreshMapa();

    // Verifica se as mesas selecionadas ainda estão livres após o refresh
    const mesasSelecionadasArray = Array.from(selecionadas);
    const mesasIndisponiveis = mesasState.filter(m => 
        mesasSelecionadasArray.includes(String(m.id)) && m.status !== "LIVRE"
    );

    if (mesasIndisponiveis.length > 0) {
        const ids = mesasIndisponiveis.map(m => m.id).join(", ");
        status.textContent = `Conflito: A(s) mesa(s) ${ids} já não está(ão) disponível(eis). Selecione outras.`;
        btn.disabled = false;
        btn.textContent = "Reservar";
        return;
    }

    btn.textContent = "Reservando...";

    try {
        const resposta = await reservarMesas(
            mesasSelecionadasArray,
            nome,
            contato
        );

        if (resposta.ok) {
            reservaAtual = {
                token: resposta.token,
                nome,
                contato,
                mesas: mesasSelecionadasArray
            };

            // 4. Depois que uma ação de escrita é concluída (reservar)
            await refreshMapa();

            mostrarTelaSucesso(nome, mesasSelecionadasArray);

            status.textContent = "";
            btn.disabled = false;
            btn.textContent = "Reservar";
        } else {
            // 6. Quando uma tentativa de escrita falha por conflito
            status.textContent = "Erro: " + resposta.erro;
            await refreshMapa(); // Atualiza para mostrar o estado real
            
            btn.disabled = false;
            btn.textContent = "Reservar";
        }
    } catch(erro) {
        status.textContent = "Erro de comunicação: " + erro.message;
        // 6. Também atualiza em caso de erro de rede/conflito
        await refreshMapa();
        
        btn.disabled = false;
        btn.textContent = "Reservar";
    }
}

// =====================================================
// Tela de sucesso da reserva
// =====================================================
function mostrarTelaSucesso(nome, mesasIds) {
    const appHome = document.getElementById("appHome");
    const telaSucesso = document.getElementById("telaSucesso");
    const saudacao = document.getElementById("sucessoSaudacao");
    const detalhes = document.getElementById("sucessoDetalhes");

    const primeiroNome = nome.trim().split(/\s+/)[0];
    const listaMesas = mesasIds.join(", ");
    const plural = mesasIds.length > 1 ? "mesas" : "mesa";

    saudacao.textContent = `Prontinho, ${primeiroNome}!`;
    detalhes.textContent = `Sua reserva da${mesasIds.length > 1 ? "s" : ""} ${plural} ${listaMesas} foi confirmada com sucesso.`;

    appHome.classList.add("oculto");
    telaSucesso.classList.remove("oculto");
}

// =====================================================
// Voltar da tela de sucesso para a home
// =====================================================
function voltarParaHome() {
    const appHome = document.getElementById("appHome");
    const telaSucesso = document.getElementById("telaSucesso");

    telaSucesso.classList.add("oculto");
    appHome.classList.remove("oculto");

    limparReserva();

    // Atualiza o mapa para refletir o estado mais recente ao voltar
    refreshMapa();
}

// =====================================================
// Cancelar reserva (se aplicável no seu fluxo)
// =====================================================
export async function cancelarReservaUsuario() {
    if (!reservaAtual) return;
    
    const status = document.getElementById("status-msg");
    status.textContent = "Cancelando reserva...";
    
    try {
        const resposta = await cancelarReserva(
            reservaAtual.mesas,
            reservaAtual.contato
        );
        
        if (resposta.ok) {
            status.textContent = "Reserva cancelada com sucesso.";
            limparReserva();
            // 4. Depois que uma ação de escrita é concluída (cancelar)
            await refreshMapa();
        } else {
            status.textContent = "Erro ao cancelar: " + resposta.erro;
            await refreshMapa();
        }
    } catch(erro) {
        status.textContent = "Erro de comunicação ao cancelar: " + erro.message;
        await refreshMapa();
    }
}

// =====================================================
// Limpar reserva
// =====================================================
export function limparReserva() {
    reservaAtual = null;

    const nome = document.getElementById("nome");
    const contato = document.getElementById("contato");
    const btn = document.getElementById("btnReservar");

    nome.value = "";
    nome.disabled = false;

    contato.value = "";
    contato.disabled = false;

    btn.style.display = "block";

    selecionadas.clear();
    atualizarResumo();
}