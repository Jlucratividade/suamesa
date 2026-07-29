// =====================================================
// PAGAMENTO - Mercado Pago
// =====================================================


import { criarPagamento } from "./api.js";

import { reservaAtual } from "./reserva.js";





// =====================================================
// Inicializa botão pagamento
// =====================================================

export function iniciarPagamento() {


    const botao =
        document.getElementById(
            "btnPagar"
        );



    botao.addEventListener(
        "click",
        executarPagamento
    );


}








// =====================================================
// Gerar cobrança Mercado Pago
// =====================================================

async function executarPagamento() {



    if (!reservaAtual) {

        return;

    }





    const botao =
        document.getElementById(
            "btnPagar"
        );



    const status =
        document.getElementById(
            "status-msg"
        );






    botao.disabled =
        true;



    botao.textContent =
        "Gerando cobrança...";



    status.textContent =
        "";







    try {



        const resposta =
            await criarPagamento(

                reservaAtual.mesas,

                reservaAtual.nome,

                reservaAtual.contato,

                reservaAtual.token

            );







        if (
            resposta.ok &&
            resposta.initPoint
        ) {



            status.textContent =
                "Redirecionando para o pagamento...";





            window.location.href =
                resposta.initPoint;



        }

        else {



            status.textContent =
                "Erro ao gerar cobrança: "
                +
                (
                    resposta.erro ||
                    "desconhecido"
                );



            botao.disabled =
                false;



            botao.textContent =
                "Pagar com Pix ou Cartão";



        }






    }

    catch(erro){



        status.textContent =
            "Erro de comunicação: "
            +
            erro.message;




        botao.disabled =
            false;



        botao.textContent =
            "Pagar com Pix ou Cartão";



    }



}