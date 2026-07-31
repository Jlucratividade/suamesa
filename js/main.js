// =====================================================
// MAIN - Inicialização da aplicação
// =====================================================

import { getMesas } from "./api.js";
import { atualizarMesas, definirCoordenadas } from "./mapa.js";
import { iniciarReserva } from "./reserva.js";
import { iniciarPagamento } from "./pagamento.js";
import { iniciarValidacao } from "./validacao.js";

// =====================================================
// CONFIGURAÇÕES
// =====================================================
const IMAGEM_URL = "https://res.cloudinary.com/db4i3tch0/image/upload/v1785236888/Projeto%20Mapa%20de%20Mesas/map_edited_uniform_kjpdf8.webp";
const CACHE_KEY = "mapaImagemBase64";
const CACHE_TIMESTAMP_KEY = "mapaImagemTimestamp";
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 dias em milissegundos

// =====================================================
// Carregar coordenadas do mapa
// =====================================================
async function carregarCoordenadas() {
    const resposta = await fetch("data/mesaCoordenadas.json");
    const dados = await resposta.json();
    definirCoordenadas(dados);
}

// =====================================================
// Carregar mesas da API
// =====================================================
async function carregarMesas() {
    try {
        const mesas = await getMesas();
        atualizarMesas(mesas);
    } catch(erro) {
        console.error("Erro ao carregar mesas:", erro);
    }
}

// =====================================================
// Gerenciamento de Cache da Imagem
// =====================================================

// Verifica se o cache está válido
function cacheEhValido() {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const idadeCache = Date.now() - parseInt(timestamp);
    return idadeCache < CACHE_EXPIRY;
}

// Carrega imagem do cache
function carregarImagemDoCache() {
    return new Promise((resolve, reject) => {
        const base64 = localStorage.getItem(CACHE_KEY);
        
        if (!base64) {
            reject("Cache vazio");
            return;
        }
        
        // Testa se a imagem carrega corretamente
        const img = new Image();
        img.onload = () => resolve(base64);
        img.onerror = () => reject("Imagem do cache corrompida");
        img.src = base64;
    });
}

// Salva imagem no cache
function salvarImagemNoCache(base64) {
    try {
        localStorage.setItem(CACHE_KEY, base64);
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        console.log("Imagem salva no cache");
    } catch(erro) {
        console.warn("Não foi possível salvar imagem no cache:", erro);
        // Se o localStorage estiver cheio, limpa e tenta salvar só a imagem
        if (erro.name === 'QuotaExceededError') {
            localStorage.clear();
            localStorage.setItem(CACHE_KEY, base64);
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        }
    }
}

// Carrega imagem da URL e converte para base64
function carregarImagemDaURL() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const base64 = canvas.toDataURL('image/webp');
                resolve(base64);
            } catch(erro) {
                reject(erro);
            }
        };
        
        img.onerror = () => reject("Erro ao carregar imagem da URL");
        img.src = IMAGEM_URL;
    });
}

// Função principal para carregar imagem com cache
async function carregarImagemComCache() {
    const loadingEl = document.getElementById("loadingImagem");
    const imgEl = document.getElementById("mapaImagem");
    
    // Mostra loading
    loadingEl.classList.remove("oculto");
    imgEl.style.display = "none";
    
    try {
        // Tenta carregar do cache primeiro
        if (cacheEhValido()) {
            console.log("Tentando carregar do cache...");
            try {
                const base64 = await carregarImagemDoCache();
                imgEl.src = base64;
                loadingEl.classList.add("oculto");
                imgEl.style.display = "block";
                console.log("Imagem carregada do cache com sucesso");
                return;
            } catch(erro) {
                console.log("Cache inválido, carregando da URL:", erro);
            }
        }
        
        // Se não tem cache válido, carrega da URL
        console.log("Carregando imagem da URL...");
        const base64 = await carregarImagemDaURL();
        
        // Salva no cache
        salvarImagemNoCache(base64);
        
        // Exibe a imagem
        imgEl.src = base64;
        loadingEl.classList.add("oculto");
        imgEl.style.display = "block";
        console.log("Imagem carregada da URL e salva no cache");
        
    } catch(erro) {
        console.error("Erro ao carregar imagem:", erro);
        loadingEl.innerHTML = `
            <div style="color: #f5a623; text-align: center;">
                ⚠️ Erro ao carregar imagem<br>
                <small>Tente atualizar a página</small>
            </div>
        `;
    }
}

// =====================================================
// Botão mostrar/ocultar mapa impresso
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
// Botão atualizar mapa (forçar recarregamento)
// =====================================================
function configurarBotaoAtualizar() {
    const btnAtualizar = document.getElementById("btnAtualizarMapa");
    
    btnAtualizar.addEventListener("click", async () => {
        btnAtualizar.disabled = true;
        btnAtualizar.textContent = "Atualizando...";
        
        // Limpa cache forçado se segurar Shift
        if (window.event && window.event.shiftKey) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TIMESTAMP_KEY);
            console.log("Cache limpo (reload forçado)");
        }
        
        await carregarMesas();
        await carregarImagemComCache();
        
        btnAtualizar.disabled = false;
        btnAtualizar.textContent = "🔄 Atualizar Mapa";
    });
}

// =====================================================
// Verificar retorno do pagamento (Mercado Pago)
// =====================================================
function verificarRetornoPagamento() {
    const params = new URLSearchParams(window.location.search);
    const pagamento = params.get("pagamento");
    
    if (!pagamento) return;

    const mesasParam = params.get("mesas") || "";
    const mesas = mesasParam.split(",").filter(Boolean);
    const listaMesas = mesas.length 
        ? "Mesa" + (mesas.length > 1 ? "s " : " ") + mesas.join(", ") 
        : "Suas mesas";

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
}

// =====================================================
// Inicialização
// =====================================================
async function iniciarAplicacao() {
    verificarRetornoPagamento();
    
    // Carrega coordenadas
    await carregarCoordenadas();
    
    // Carrega imagem com cache (sem perguntar nada, já mostra loading)
    await carregarImagemComCache();
    
    // Carrega mesas
    await carregarMesas();
    
    // Configura botões
    configurarMapaImagem();
    configurarBotaoAtualizar();
    
    // Inicializa módulos
    iniciarValidacao();
    iniciarReserva();
    iniciarPagamento();
}

iniciarAplicacao();
