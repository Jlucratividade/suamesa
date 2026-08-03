import { verificarHabilitacaoBotao } from "./validacao.js";

// =====================================================
// MAPA - Renderização e seleção das mesas
// =====================================================


export let mesasState = [];

export let selecionadas = new Set();

export let mesaCoordenadas = {};





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



            el.title =
                `Mesa ${mesa.id} · ${mesa.capacidade} lugares · R$ ${Number(mesa.preco).toFixed(2)}`;





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





        marcador.title =
            `Mesa ${mesa.id} · ${mesa.capacidade} lugares · R$ ${Number(mesa.preco).toFixed(2)}`;







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
        "selecionada"
    );



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

    const total =
        mesasState
            .filter(m =>
                selecionadas.has(
                    String(m.id)
                )
            )
            .reduce(
                (soma, m) =>
                    soma + Number(m.preco),
                0
            );

    resumo.textContent =
        `Mesas: ${lista} · Total: R$ ${total.toFixed(2)}`;

    // CORREÇÃO: Em vez de forçar disabled = false, 
    // delegamos a decisão para a função que valida nome e contato também
    verificarHabilitacaoBotao(selecionadas.size);

}
