// =====================================================
// RESERVAS
// Controle do fluxo de reserva das mesas
// =====================================================
import { validarFormulario } from "./validacao.js";
import { reservarMesas, cancelarReserva } from "./api.js";
import { selecionadas, atualizarResumo, mesasState } from "./mapa.js";
import { salvarReservaSucesso, salvarReservaErro } from "./estadoReserva.js";

export let reservaAtual = null;
let refreshMapaCallback = null;

// =====================================================
// Inicializa botão reservar
// =====================================================
export function iniciarReserva(callbackRefresh) {
    refreshMapaCallback = callbackRefresh;

    const btn = document.getElementById("btnReservar");
    btn.addEventListener("click", executarReserva);
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

        // Guarda o motivo do erro e manda para a página de erro
        salvarReservaErro({
            mensagem: `A(s) mesa(s) ${ids} já não está(ão) disponível(eis). Selecione outras.`,
            mesas: mesasSelecionadasArray,
            nome,
            contato
        });

        window.location.href = "erro.html";
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

            // Guarda os dados da reserva confirmada para a página de sucesso
            // (e para destacar a mesa/nome quando o usuário voltar à home)
            salvarReservaSucesso({
                nome,
                contato,
                mesas: mesasSelecionadasArray,
                token: resposta.token,
                // O backend pode não devolver um horário específico da
                // reserva; usamos o momento em que a confirmação chegou
                // ao navegador como "horário da reserva efetivada".
                horario: resposta.horario || resposta.dataReserva || new Date().toISOString(),
                mensagem: resposta.mensagem || null
            });

            // 4. Depois que uma ação de escrita é concluída (reservar)
            await refreshMapa();

            window.location.href = "sucesso.html";
        } else {
            // 6. Quando uma tentativa de escrita falha por conflito
            salvarReservaErro({
                mensagem: resposta.erro || "Não foi possível concluir sua reserva.",
                mesas: mesasSelecionadasArray,
                nome,
                contato
            });

            await refreshMapa(); // Atualiza para mostrar o estado real

            window.location.href = "erro.html";
        }
    } catch(erro) {
        salvarReservaErro({
            mensagem: "Erro de comunicação: " + erro.message,
            mesas: mesasSelecionadasArray,
            nome,
            contato
        });

        // 6. Também atualiza em caso de erro de rede/conflito
        await refreshMapa();

        window.location.href = "erro.html";
    }
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
    document.getElementById("btnReservar").style.display = "block";
    document.getElementById("nome").disabled = false;
    document.getElementById("contato").disabled = false;
    atualizarResumo();
}
