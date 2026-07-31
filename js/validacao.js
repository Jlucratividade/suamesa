// =====================================================
// VALIDAÇÕES DOS CAMPOS DO FORMULÁRIO
// =====================================================

const nome = document.getElementById("nome");
const contato = document.getElementById("contato");
const btnReservar = document.getElementById("btnReservar");

// Validação do nome
function validarNome() {
  const valor = nome.value.trim();

  if (valor === "") {
    nome.setCustomValidity("Digite seu nome.");
    return false;
  }

  if (valor.length < 3) {
    nome.setCustomValidity("O nome deve ter pelo menos 3 letras.");
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
    contato.setCustomValidity("Digite seu WhatsApp.");
    return false;
  } else if (numero.length !== 11) {
    contato.setCustomValidity("O WhatsApp deve ter 11 números com DDD.");
    return false;
  }
  
  contato.setCustomValidity("");
  return true;
}

// ← NOVA FUNÇÃO: verifica se pode habilitar o botão
export function verificarHabilitacaoBotao(mesasSelecionadasCount) {

    console.log("mesasSelecionadasCount =", mesasSelecionadasCount);

    const nomeValido = validarNome();
    const contatoValido = validarContato();

    console.log("nomeValido =", nomeValido);
    console.log("contatoValido =", contatoValido);

    const temMesas = mesasSelecionadasCount > 0;

    console.log("temMesas =", temMesas);

    if (temMesas && nomeValido && contatoValido) {

        btnReservar.disabled = false;
        btnReservar.textContent = "Reservar e ir para pagamento";

    } else if (!temMesas) {

        btnReservar.disabled = true;
        btnReservar.textContent = "Selecione ao menos 1 mesa";

    } else {

        btnReservar.disabled = true;
        btnReservar.textContent = "Preencha nome e WhatsApp corretamente";

    }
}

// Inicializa eventos
export function iniciarValidacao() {
  nome.addEventListener("input", () => {
    validarNome();
    // ← Chama verificação do botão a cada digitação
    const selecionadas = document.querySelector('.selecionada');
    const count = document.querySelectorAll('.selecionada').length;
    verificarHabilitacaoBotao(count);
  });
  
  contato.addEventListener("input", () => {
    validarContato();
    // ← Chama verificação do botão a cada digitação
    const count = document.querySelectorAll('.selecionada').length;
    verificarHabilitacaoBotao(count);
  });
}

// Validação para uso em outros arquivos
export function validarFormulario() {
  return validarNome() && validarContato();
}
