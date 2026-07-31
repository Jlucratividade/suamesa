// =====================================================
// TIMER - Controle do tempo de reserva
//
// ATENÇÃO — MÓDULO ATUALMENTE DESATIVADO (não é mais
// chamado por reserva.js): a regra de negócio mudou e a
// reserva de uma mesa não expira mais individualmente por
// um cronômetro no navegador de cada cliente. Quem decide
// quando "desreservar" as mesas agora é o administrador,
// através de um gatilho agendado no painel /admin (ver
// GAS/AdminAcoes.gs -> criarGatilhoLiberarReservadas).
//
// O código abaixo foi mantido no projeto (não apagado) caso
// no futuro se queira reativar um cronômetro por usuário —
// mas hoje ele não é importado/usado em nenhum lugar ativo.
// =====================================================


import { limparReserva } from "./reserva.js";



let holdExpiraEm = null;

let cronometroInterval = null;





// =====================================================
// Iniciar contador
// =====================================================

export function iniciarCronometro(expiraEm) {


    holdExpiraEm =
        new Date(expiraEm);



    clearInterval(
        cronometroInterval
    );



    cronometroInterval =
        setInterval(
            atualizarCronometro,
            1000
        );


}








// =====================================================
// Atualiza texto do contador
// =====================================================

function atualizarCronometro() {


    const elemento =
        document.getElementById(
            "cronometro"
        );



    if (!holdExpiraEm) {


        elemento.textContent =
            "";


        return;

    }







    const restante =
        Math.max(
            0,
            holdExpiraEm - new Date()
        );







    if (restante <= 0) {



        elemento.textContent =
            "Tempo de reserva expirado. Mesas liberadas.";




        clearInterval(
            cronometroInterval
        );




        holdExpiraEm =
            null;




        limparReserva();




        return;


    }







    const minutos =
        Math.floor(
            restante / 60000
        );




    const segundos =
        Math.floor(
            (restante % 60000) / 1000
        );







    elemento.textContent =
        `Finalize o pagamento em: ${minutos}:${String(segundos).padStart(2,"0")}`;


}








// =====================================================
// Parar contador manualmente
// =====================================================

export function pararCronometro() {


    clearInterval(
        cronometroInterval
    );


    cronometroInterval =
        null;


    holdExpiraEm =
        null;



}