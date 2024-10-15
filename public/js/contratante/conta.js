function validarNome(nome) {
    return nome.length > 0;
}

function validarEmail(email) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
}

function validarTelefone(telefone) {
    const regexTelefone = /^\d{10,11}$/; // Exemplo para telefones brasileiros
    return regexTelefone.test(telefone);
}

function validarCpf(cpf) {
    const regexCpf = /^\d{11}$/; // CPF deve ter 11 dígitos
    // Aqui você pode adicionar a lógica de validação do CPF se necessário
    return regexCpf.test(cpf);
}

function validarSenha(senha) {
    return senha.length >= 6;
}

function validarRepetirSenha(senha, repetirSenha) {
    return senha === repetirSenha;
}

function validarCep(cep) {
    const regexCep = /^\d{5}-?\d{3}$/;
    return regexCep.test(cep);
}

function validarNumero(numero) {
    return numero.length > 0;
}

function validarCheckbox(checkbox) {
    return checkbox === true;
}

function adicionarErro(erros, mensagem) {
    erros.push(mensagem);
}

function validarDados(formData) {
    let erros = [];

    if (!validarNome(formData.primeiroNome)) adicionarErro(erros, "Primeiro nome inválido");
    if (!validarNome(formData.sobrenome)) adicionarErro(erros, "Sobrenome inválido");
    if (!validarEmail(formData.email)) adicionarErro(erros, "Email inválido");
    if (!validarTelefone(formData.telefone)) adicionarErro(erros, "Telefone inválido");
    if (!validarCpf(formData.cpf)) adicionarErro(erros, "CPF inválido");
    if (!validarSenha(formData.senha)) adicionarErro(erros, "Senha deve ter pelo menos 6 caracteres");
    if (!validarRepetirSenha(formData.senha, formData.repetirSenha)) adicionarErro(erros, "As senhas não coincidem");
    if (!validarCep(formData.cep)) adicionarErro(erros, "CEP inválido");
    if (!validarNome(formData.rua)) adicionarErro(erros, "Rua inválida");
    if (!validarNome(formData.bairro)) adicionarErro(erros, "Bairro inválido");
    if (!validarNumero(formData.numero)) adicionarErro(erros, "Número inválido");
    if (!validarCheckbox(formData.aceitouTermos)) adicionarErro(erros, "Você deve aceitar os termos e condições");

    return erros;
}

$('#FormCriarUsuario').on('submit', function (e) {
    e.preventDefault(); // Previne o envio padrão do formulário

    let formData = {
        primeiroNome: $('.input.nome').eq(0).val().trim(),
        sobrenome: $('.input.nome').eq(1).val().trim(),
        email: $('.input.email').val().trim(),
        telefone: $('.input.telefone').val().trim().replace(/\D/g, ''),
        celular: $('.input.celular').val().trim().replace(/\D/g, ''),
        whatsapp: $('.input.whatsapp').val().trim().replace(/\D/g, ''),
        cpf: $('.input.cpf').val().trim().replace(/\D/g, ''),
        senha: $('.input.senha').val().trim(),
        repetirSenha: $('.input.againsenha').val().trim(),
        cep: $('.input.cep').val().trim().replace(/\D/g, ''),
        rua: $('.input.rua').val().trim(),
        bairro: $('.bairro').val().trim(),
        numero: $('.input.numero').val().trim(),
        complemento: $('.complemento').val().trim(),
        aceitouTermos: $('#checkTerms input[type="checkbox"]').is(':checked')
    };

    let erros = validarDados(formData);

    if (erros.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de Validação',
            text: 'Verifique os campos e tente novamente.',
            footer: erros.join('<br>')
        });
    } else {
        $(".SendForm").html(`<section class="loading-container"><div class='loading-form-animation'></div></section>`);

        $.ajax({
            url: '../../../controllers/contratante/CreateAccount.php',
            type: 'POST',
            data: formData, 
            success: function (response) {
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
                        text: 'Login não efetuado!'
                    });
                }
            },
            error: function (xhr, status, error) {
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

// Consulta de CEP
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