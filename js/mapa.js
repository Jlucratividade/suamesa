import { verificarHabilitacaoBotao } from "./validacao.js";

// =====================================================
// MAPA - Renderização e seleção das mesas
// =====================================================


export let mesasState = [];

export let selecionadas = new Set();

export let mesaCoordenadas = {};

// Mesas que devem aparecer "em destaque" (ex.: mesa da última reserva
// confirmada, quando o usuário volta para a home)
export let mesasDestaque = new Set();

export function definirMesasDestaque(ids) {
    mesasDestaque = new Set((ids || []).map(String));
}

export function limparMesasDestaque() {
    mesasDestaque = new Set();
}





// =====================================================
// Recebe coordenadas do JSON
// =====================================================

export function definirCoordenadas(dados) {

    mesaCoordenadas = dados;

}






// =====================================================
// Atualiza estado das mesas
// =====================================================

export function atualizarMesas(mesas) {


    mesasState = mesas;


    renderMapa(mesas);


}






// =====================================================
// Renderiza mapa por setores
// =====================================================

export function renderMapa(mesas) {


    renderMarcadoresImagem(mesas);



    const setores = {};



    mesas.forEach(m => {


        if (!setores[m.setor]) {

            setores[m.setor] = [];

        }


        setores[m.setor].push(m);


    });




    const mapaEl = document.getElementById("mapa");


    mapaEl.innerHTML = "";





    Object.keys(setores).forEach(setor => {



        const bloco = document.createElement("div");


        bloco.className = "setor";



        bloco.innerHTML = `

            <div class="setor-titulo">

                ${setor}

            </div>


            <div class="grid"></div>

        `;




        const grid = bloco.querySelector(".grid");






        setores[setor].forEach(mesa => {



            const el = document.createElement("div");


            el.className = "mesa";



            el.textContent = mesa.id;



            // MÉTODO DE PAGAMENTO DESATIVADO NESTA VERSÃO (apenas reserva):
            // o valor da mesa (preço) está atrelado ao pagamento, então
            // deixamos de exibi-lo para o cliente. Código original mantido
            // comentado para reativação futura, se o pagamento voltar a
            // fazer parte do fluxo.
            // el.title =
            //     `Mesa ${mesa.id} · ${mesa.capacidade} lugares · R$ ${Number(mesa.preco).toFixed(2)}`;
            el.title =
                `Mesa ${mesa.id} · ${mesa.capacidade} lugares`;





            aplicarStatus(
                el,
                mesa
            );





            if (mesa.status === "LIVRE") {


                el.addEventListener(
                    "click",
                    () => toggleSelecao(
                        String(mesa.id)
                    )
                );


            }





            grid.appendChild(el);



        });





        mapaEl.appendChild(bloco);



    });





}








// =====================================================
// Marcadores sobre imagem
// =====================================================

export function renderMarcadoresImagem(mesas) {


    const container =
        document.getElementById(
            "mapaImagemContainer"
        );



    if (!container) return;





    container
        .querySelectorAll(".marcador-mesa")
        .forEach(el => el.remove());







    mesas.forEach(mesa => {



        const coord =
            mesaCoordenadas[
                String(mesa.id)
            ];



        if (!coord) return;






        const marcador =
            document.createElement("div");



        marcador.className =
            "marcador-mesa";




        marcador.style.left =
            coord.x + "%";



        marcador.style.top =
            coord.y + "%";




        marcador.textContent =
            mesa.id;





        // MÉTODO DE PAGAMENTO DESATIVADO NESTA VERSÃO (apenas reserva):
        // idem ao tooltip da grade — preço comentado, código preservado.
        // marcador.title =
        //     `Mesa ${mesa.id} · ${mesa.capacidade} lugares · R$ ${Number(mesa.preco).toFixed(2)}`;
        marcador.title =
            `Mesa ${mesa.id} · ${mesa.capacidade} lugares`;







        aplicarStatus(
            marcador,
            mesa
        );







        if (mesa.status === "LIVRE") {


            marcador.addEventListener(
                "click",
                () => toggleSelecao(
                    String(mesa.id)
                )
            );


        }





        container.appendChild(marcador);



    });




}








// =====================================================
// Aplica cores conforme status
// =====================================================

function aplicarStatus(
    elemento,
    mesa
) {


    elemento.classList.remove(
        "reservada",
        "paga",
        "selecionada",
        "destaque"
    );

    if (mesasDestaque.has(String(mesa.id))) {
        elemento.classList.add("destaque");
    }



    if (
        mesa.status === "RESERVADA"
    ) {


        elemento.classList.add(
            "reservada"
        );


    }

    else if (
        mesa.status === "PAGA"
    ) {


        elemento.classList.add(
            "paga"
        );


    }

    else if (
        selecionadas.has(
            String(mesa.id)
        )
    ) {


        elemento.classList.add(
            "selecionada"
        );


    }


}








// =====================================================
// Selecionar / remover mesa
// =====================================================

export function toggleSelecao(id) {


    if (
        selecionadas.has(id)
    ) {


        selecionadas.delete(id);


    } else {


        selecionadas.add(id);


    }





    renderMapa(
        mesasState
    );



    atualizarResumo();

}




export function atualizarResumo() {

    const resumo =
        document.getElementById(
            "resumo-selecao"
        );

    // Não precisamos mais pegar o "botao" aqui diretamente, 
    // pois a função verificarHabilitacaoBotao vai cuidar disso.

    if (selecionadas.size === 0) {

        resumo.textContent =
            "Nenhuma mesa selecionada.";

        // Chama a função passando 0 para forçar o estado desabilitado
        verificarHabilitacaoBotao(0);

        return;
    }

    const lista =
        Array.from(selecionadas)
            .join(", ");

    // MÉTODO DE PAGAMENTO DESATIVADO NESTA VERSÃO (apenas reserva):
    // o cálculo do valor total é parte do fluxo de pagamento, que não
    // existe mais aqui. Código original comentado para reativação futura.
    //
    // const total =
    //     mesasState
    //         .filter(m =>
    //             selecionadas.has(
    //                 String(m.id)
    //             )
    //         )
    //         .reduce(
    //             (soma, m) =>
    //                 soma + Number(m.preco),
    //             0
    //         );
    //
    // resumo.textContent =
    //     `Mesas: ${lista} · Total: R$ ${total.toFixed(2)}`;

    resumo.textContent =
        `Mesas selecionadas: ${lista}`;

    // CORREÇÃO: Em vez de forçar disabled = false, 
    // delegamos a decisão para a função que valida nome e contato também
    verificarHabilitacaoBotao(selecionadas.size);

}
