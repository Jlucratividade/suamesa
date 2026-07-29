// =====================================================
// API - Comunicação com Google Apps Script
// Frontend GitHub Pages
// =====================================================


// URL do Web App Apps Script
const API_URL =
"https://script.google.com/macros/s/AKfycbwbkB4TVozlCIwvtPosb5nxv09Q-AC7rpZeT3nTf3KaCF7w20LqeysEgutZXDv82Ce3Pg/exec";




// =====================================================
// GET genérico
// =====================================================

async function apiGet(params = {}) {


    const url =
        new URL(API_URL);



    Object.keys(params).forEach(chave => {


        url.searchParams.append(

            chave,

            params[chave]

        );


    });




    const resposta =
        await fetch(url);



    if (!resposta.ok) {


        throw new Error(

            "Erro HTTP GET: "
            +
            resposta.status

        );


    }





    const texto =
        await resposta.text();




    try {


        return JSON.parse(texto);



    } catch(e) {


        console.error(
            "Resposta recebida:",
            texto
        );


        throw new Error(
            "Resposta inválida da API."
        );


    }


}









// =====================================================
// POST genérico
// =====================================================

async function apiPost(dados) {



    const resposta =
        await fetch(

            API_URL,

            {

                method:"POST",


                headers:{


                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify(dados)


            }

        );





    if (!resposta.ok) {


        throw new Error(

            "Erro HTTP POST: "
            +
            resposta.status

        );


    }






    const texto =
        await resposta.text();





    try {


        return JSON.parse(texto);



    } catch(e) {


        console.error(
            "Resposta recebida:",
            texto
        );


        throw new Error(
            "Resposta inválida da API."
        );


    }



}









// =====================================================
// Buscar mesas
// Substitui:
// google.script.run.getMesasParaFrontend()
// =====================================================

async function getMesas(){



    const resposta =
        await apiGet({

            acao:"getMesas"

        });




    if(!resposta.ok){


        throw new Error(

            resposta.erro ||
            "Erro ao carregar mesas."

        );


    }




    return resposta.mesas || [];

}









// =====================================================
// Reservar mesas
// Substitui:
// reservarMesasApp()
// =====================================================

async function reservarMesas(

    idsMesas,

    nome,

    contato

){



    return await apiPost({

        acao:"reservarMesas",


        idsMesas,


        nome,


        contato


    });



}









// =====================================================
// Cancelar reserva
// =====================================================

async function cancelarReserva(

    idsMesas,

    contato

){



    return await apiPost({

        acao:"cancelarReserva",


        idsMesas,


        contato


    });



}









// =====================================================
// Criar pagamento Mercado Pago
// Substitui:
// criarPreferenciaPagamentoApp()
// =====================================================

async function criarPagamento(

    idsMesas,

    nome,

    contato,

    token

){



    return await apiPost({

        acao:"criarPagamento",


        idsMesas,


        nome,


        contato,


        token


    });



}
