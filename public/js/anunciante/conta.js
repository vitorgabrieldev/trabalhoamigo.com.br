// Funções de validação modular

/**
 * Valida se o nome não está vazio.
 * @param {string} nome - O nome a ser validado.
 * @return {boolean} - Retorna true se o nome for válido.
 */
 function validarNome(nome) {
    return nome.length > 0;
}

/**
 * Valida se o email está no formato correto.
 * @param {string} email - O email a ser validado.
 * @return {boolean} - Retorna true se o email for válido.
 */
function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}

/**
 * Valida se o telefone está no formato correto (10 ou 11 dígitos).
 * @param {string} telefone - O telefone a ser validado.
 * @return {boolean} - Retorna true se o telefone for válido.
 */
function validarTelefone(telefone) {
    const regexTelefone = /^\d{10,11}$/; // Exemplo para telefones brasileiros
    return regexTelefone.test(telefone);
}

/**
 * Valida se a senha tem pelo menos 6 caracteres.
 * @param {string} senha - A senha a ser validada.
 * @return {boolean} - Retorna true se a senha for válida.
 */
function validarSenha(senha) {
    return senha.length >= 6;
}

/**
 * Valida se a senha e a confirmação de senha são iguais.
 * @param {string} senha - A senha original.
 * @param {string} repetirSenha - A senha de confirmação.
 * @return {boolean} - Retorna true se as senhas coincidirem.
 */
function validarRepetirSenha(senha, repetirSenha) {
    return senha === repetirSenha;
}

/**
 * Valida se o CEP está no formato correto (XXXXX-XXX).
 * @param {string} cep - O CEP a ser validado.
 * @return {boolean} - Retorna true se o CEP for válido.
 */
function validarCep(cep) {
    const regexCep = /^\d{5}-?\d{3}$/;
    return regexCep.test(cep);
}

/**
 * Valida se o número da residência não está vazio.
 * @param {string} numero - O número da residência a ser validado.
 * @return {boolean} - Retorna true se o número for válido.
 */
function validarNumero(numero) {
    return numero.length > 0;
}

/**
 * Valida se a caixa de seleção foi marcada.
 * @param {boolean} checkbox - O estado da caixa de seleção.
 * @return {boolean} - Retorna true se a caixa de seleção estiver marcada.
 */
function validarCheckbox(checkbox) {
    return checkbox === true;
}

// Função principal de validação

/**
 * Função que valida todos os dados do formulário.
 * @param {object} formData - Um objeto contendo os dados do formulário.
 * @return {Array} - Retorna um array de mensagens de erro, se houver.
 */
function validarDados(formData) {
    let erros = [];

    if (!validarNome(formData.primeiroNome)) erros.push("Primeiro nome inválido");
    if (!validarNome(formData.sobrenome)) erros.push("Sobrenome inválido");
    if (!validarEmail(formData.email)) erros.push("Email inválido");
    if (!validarTelefone(formData.telefone)) erros.push("Telefone inválido");
    if (!validarSenha(formData.senha)) erros.push("Senha deve ter pelo menos 6 caracteres");
    if (!validarRepetirSenha(formData.senha, formData.repetirSenha)) erros.push("As senhas não coincidem");
    if (!validarCep(formData.cep)) erros.push("CEP inválido");
    if (!validarNome(formData.rua)) erros.push("Rua inválida");
    if (!validarNome(formData.bairro)) erros.push("Bairro inválido");
    if (!validarNumero(formData.numero)) erros.push("Número inválido");
    if (!validarCheckbox(formData.aceitouTermos)) erros.push("Você deve aceitar os termos e condições");

    return erros;
}

$('#FormCriarUsuario').on('submit', function (e) {
    e.preventDefault(); // Previne o envio padrão do formulário

    let formData = {
        primeiroNome: $('.input.nome').eq(0).val().trim(), // Obtém o valor do primeiro nome
        sobrenome: $('.input.nome').eq(1).val().trim(),    // Obtém o valor do sobrenome
        email: $('.input.email').val().trim(),             // Obtém o valor do email
        telefone: $('.input.telefone').val().trim(),       // Obtém o valor do telefone
        celular: $('.input.celular').val().trim(),       // Obtém o valor do celular
        whatsapp: $('.input.whatsapp').val().trim(),       // Obtém o valor do Whatsapp
        cpf: $('.input.cpf').val().trim(),       // Obtém o valor do cpf
        senha: $('.input.senha').val().trim(),             // Obtém o valor da senha
        repetirSenha: $('.input.againsenha').val().trim(), // Obtém o valor da confirmação de senha
        cep: $('.input.cep').val().trim(),                 // Obtém o valor do CEP
        rua: $('.input.rua').val().trim(),                 // Obtém o valor da rua
        bairro: $('.bairro').val().trim(),                 // Obtém o valor do bairro
        numero: $('.input.numero').val().trim(),           // Obtém o valor do número da residência
        complemento: $('.complemento').val().trim(),       // Obtém o valor do complemento (se houver)
        aceitouTermos: $('#checkTerms input[type="checkbox"]').is(':checked') // Verifica se os termos foram aceitos
    };

    let erros = validarDados(formData); // Valida os dados do formulário

    if (erros.length > 0) {
        console.log("Erros de validação:", erros); // Exibe os erros no console
        Swal.fire({
            icon: 'error',
            title: 'Erro de Validação',
            text: 'Verifique os campos e tente novamente.',
            footer: erros.join('<br>') // Mostra todos os erros em uma linha
        });
    } else {

        // Ativa animação de loading
        $(".SendForm").html(`<section class="loading-container"><div class='loading-form-animation'></div></section>`);

        $.ajax({
            url: '../../../controllers/anunciante/CreateAccount.php',
            type: 'POST',
            data: formData, 
            success: function (response) {

                // Desativa animação de loading
                $(".SendForm").html("Cadastrar");

                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: 'Login efetuado com sucesso!'
                    });
                    
                    window.location.href = "../PaginaInicial/";

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Login não efetuado!.'
                    });
                };
            },
            error: function (xhr, status, error) {
                
                // Desativa animação de loading
                $(".SendForm").html("Cadastrar");

                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um erro. Tente novamente.'
                });
            }
        });
        
    }
});

$('.input.cep').on('blur', function () {
    const cep = $(this).val().trim().replace(/\D/g, ''); // Remove caracteres não numéricos
    if (cep.length === 8) {
        $.ajax({
            url: `https://viacep.com.br/ws/${cep}/json/`,
            method: 'GET',
            success: function (data) {
                if (data.erro) {
                    Swal.fire({
                        icon: 'error',
                        title: 'CEP Inválido',
                        text: 'Não foi possível encontrar o CEP informado.'
                    });
                } else {
                    // Preenche os campos com os dados do CEP
                    $('.input.rua').val(data.logradouro);
                    $('.input.bairro').val(data.bairro);
                    $('.input.cidade').val(data.localidade);
                    $('.input.uf').val(data.uf);

                    // Remove as labels dos campos preenchidos
                    $('.input.rua').siblings('label').hide();
                    $('.input.bairro').siblings('label').hide();
                    $('.input.cidade').siblings('label').hide();
                    $('.input.uf').siblings('label').hide();
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro ao consultar o CEP. Tente novamente mais tarde.'
                });
            }
        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'CEP Inválido',
            text: 'O CEP deve ter 8 dígitos.'
        });
    }
});
