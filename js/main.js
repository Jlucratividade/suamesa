// =====================================================
// MAIN - Inicialização da aplicação
// =====================================================


import {
    getMesas
} from "./api.js";


import {
    atualizarMesas,
    definirCoordenadas
} from "./mapa.js";


import {
    iniciarReserva
} from "./reserva.js";


import {
    iniciarPagamento
} from "./pagamento.js";





const POLL_MS = 20000;







// =====================================================
// Carregar coordenadas do mapa
// =====================================================

async function carregarCoordenadas() {


    const resposta =
        await fetch(
            "data/mesaCoordenadas.json"
        );



    const dados =
        await resposta.json();



    definirCoordenadas(
        dados
    );


}









// =====================================================
// Carregar mesas da API
// =====================================================

async function carregarMesas() {


    try {


        const mesas =
            await getMesas();



        atualizarMesas(
            mesas
        );


    }

    catch(erro) {


        console.error(
            "Erro ao carregar mesas:",
            erro
        );


    }


}









// =====================================================
// Botão mostrar mapa impresso
// =====================================================

function configurarMapaImagem() {


    const botao =
        document.getElementById(
            "btnToggleMapa"
        );



    const wrapper =
        document.getElementById(
            "mapaImagemWrapper"
        );





    botao.addEventListener(
        "click",
        () => {


            const oculto =
                wrapper.classList.contains(
                    "oculto"
                );



            if (oculto) {


                wrapper.classList.remove(
                    "oculto"
                );


                botao.textContent =
                    "Ocultar mapa impresso";


            }

            else {


                wrapper.classList.add(
                    "oculto"
                );


                botao.textContent =
                    "Ver mapa impresso";


            }



        }
    );


}








// =====================================================
// Verificar retorno do pagamento (Mercado Pago)
// Lê ?pagamento=ok|pendente|erro&mesas=1,2,3 na URL
// =====================================================

function verificarRetornoPagamento() {


    const params =
        new URLSearchParams(
            window.location.search
        );


    const pagamento =
        params.get("pagamento");


    if (!pagamento) {

        return;

    }



    const mesasParam =
        params.get("mesas") || "";


    const mesas =
        mesasParam
            .split(",")
            .filter(Boolean);


    const listaMesas =
        mesas.length
            ? "Mesa" + (mesas.length > 1 ? "s " : " ") + mesas.join(", ")
            : "Suas mesas";



    let mensagem = "";


    if (pagamento === "ok") {


        mensagem =
            listaMesas +
            " compradas com sucesso! " +
            "Em instantes a informação será atualizada no mapa.";


    }

    else if (pagamento === "pendente") {


        mensagem =
            listaMesas +
            ": pagamento pendente de confirmação. " +
            "Assim que for aprovado, o mapa será atualizado automaticamente.";


    }

    else {


        mensagem =
            listaMesas +
            ": não foi possível confirmar o pagamento. " +
            "Tente novamente ou entre em contato conosco.";


    }



    alert(mensagem);



    // Limpa os parâmetros da URL para não repetir
    // o alerta se a página for recarregada
    const urlLimpa =
        window.location.origin
        +
        window.location.pathname;


    window.history.replaceState(
        {},
        "",
        urlLimpa
    );


}




// =====================================================
// Inicialização
// =====================================================

async function iniciarAplicacao() {



    verificarRetornoPagamento();



    await carregarCoordenadas();



    await carregarMesas();



    iniciarReserva();



    iniciarPagamento();



    configurarMapaImagem();




    setInterval(
        carregarMesas,
        POLL_MS
    );



}






iniciarAplicacao();
