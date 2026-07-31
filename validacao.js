// =====================================================
// VALIDAÇÕES DOS CAMPOS DO FORMULÁRIO
// =====================================================

const nome = document.getElementById("nome");
const contato = document.getElementById("contato");


// Validação do nome
function validarNome() {

    const valor = nome.value.trim();

    if (valor === "") {

        nome.setCustomValidity(
            "Digite seu nome completo."
        );

        return false;

    } else if (valor.length < 5) {

        nome.setCustomValidity(
            "O nome deve ter pelo menos 5 caracteres."
        );

        return false;

    } else if (!/^[A-Za-zÀ-ÿ]+(\s+[A-Za-zÀ-ÿ]+)+$/.test(valor)) {

        nome.setCustomValidity(
            "Digite nome e sobrenome usando apenas letras."
        );

        return false;

    }

    nome.setCustomValidity("");
    return true;
}


// Validação do WhatsApp
function validarContato() {

    const numero = contato.value.replace(/\D/g, "");

    contato.value = numero;

    if (numero === "") {

        contato.setCustomValidity(
            "Digite seu WhatsApp."
        );

        return false;

    } else if (numero.length !== 11) {

        contato.setCustomValidity(
            "O WhatsApp deve ter 11 números com DDD."
        );

        return false;

    }

    contato.setCustomValidity("");
    return true;
}


// Inicializa eventos
export function iniciarValidacao() {

    nome.addEventListener("input", validarNome);

    contato.addEventListener("input", validarContato);

}


// Validação para uso em outros arquivos
export function validarFormulario() {

    return validarNome() && validarContato();

}