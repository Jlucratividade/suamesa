// =====================================================
// RESERVAS
// Controle do fluxo de reserva das mesas
// =====================================================


import { reservarMesas } from "./api.js";

import {
    selecionadas,
    atualizarResumo
} from "./mapa.js";

import {
    iniciarCronometro,
    pararCronometro
} from "./timer.js";





export let reservaAtual = null;






// =====================================================
// Inicializa botão reservar
// =====================================================

export function iniciarReserva() {


    const btn =
        document.getElementById(
            "btnReservar"
        );



    btn.addEventListener(
        "click",
        executarReserva
    );


}








// =====================================================
// Executa reserva
// =====================================================

async function executarReserva() {



    const nome =
        document.getElementById(
            "nome"
        )
        .value
        .trim();




    const contato =
        document.getElementById(
            "contato"
        )
        .value
        .trim();




    const status =
        document.getElementById(
            "status-msg"
        );






    if (!nome || !contato) {


        status.textContent =
            "Preencha nome e contato antes de reservar.";


        return;


    }







    const btn =
        document.getElementById(
            "btnReservar"
        );



    btn.disabled = true;


    btn.textContent =
        "Reservando...";



    status.textContent =
        "";






    try {



        const resposta =
            await reservarMesas(

                Array.from(
                    selecionadas
                ),

                nome,

                contato

            );







        if (
            resposta.ok
        ) {



            status.textContent =
                resposta.mensagem;





            reservaAtual = {


                token:
                    resposta.token,


                nome,


                contato,



                mesas:
                    Array.from(
                        selecionadas
                    )


            };







            iniciarCronometro(
                resposta.expiraEm
            );






            btn.style.display =
                "none";






            document.getElementById(
                "nome"
            )
            .disabled = true;





            document.getElementById(
                "contato"
            )
            .disabled = true;






            const btnPagar =
                document.getElementById(
                    "btnPagar"
                );





            btnPagar.classList.remove(
                "oculto"
            );



            btnPagar.disabled =
                false;



            btnPagar.textContent =
                "Pagar com Pix ou Cartão";





        }

        else {



            status.textContent =
                "Erro: " + resposta.erro;




            btn.disabled =
                false;




            btn.textContent =
                "Reservar e ir para pagamento";



        }





    }

    catch(erro){



        status.textContent =
            "Erro de comunicação: "
            + erro.message;



        btn.disabled =
            false;



        btn.textContent =
            "Reservar e ir para pagamento";


    }








}









// =====================================================
// Limpar reserva quando expirar
// =====================================================

export function limparReserva() {


    reservaAtual = null;



    pararCronometro();



    document.getElementById(
        "btnPagar"
    )
    .classList.add(
        "oculto"
    );




    document.getElementById(
        "btnReservar"
    )
    .style.display =
        "block";





    document.getElementById(
        "nome"
    )
    .disabled = false;




    document.getElementById(
        "contato"
    )
    .disabled = false;





    atualizarResumo();



}