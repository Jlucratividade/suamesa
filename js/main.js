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
// Inicialização
// =====================================================

async function iniciarAplicacao() {



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