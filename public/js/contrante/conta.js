$(document).ready(function () {
    $('#FormCriarUsuario').on('submit', function (e) {
        e.preventDefault(); // Impede o envio do formulário

        // Captura dos dados dos campos
        let primeiroNome = $('.input.nome').eq(0).val().trim();
        let sobrenome = $('.input.nome').eq(1).val().trim();
        let email = $('.input.email').val().trim();
        let telefone = $('.input.telefone').val().trim();
        let senha = $('.input.senha').eq(0).val().trim();
        let repetirSenha = $('.input.senha').eq(1).val().trim();
        let celular = $('.input.celular').val().trim();
        let whatsapp = $('.input.whatsapp').val().trim();
        let cpf = $('.input.cpf').val().trim();
        let cep = $('.input.cep').val().trim();
        let rua = $('.input.rua').val().trim();
        let bairro = $('.input.bairro').val().trim();
        let numero = $('.input.numero').val().trim();
        let complemento = $('.input.complemento').val().trim();
        let aceitouTermos = $('#checkTerms input[type="checkbox"]').is(':checked');

        // Validações
        if (primeiroNome === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Primeiro Nome".'
            });
            return;
        }

        if (sobrenome === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Sobrenome".'
            });
            return;
        }

        if (email === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Email".'
            });
            return;
        } else if (!validateEmail(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Email Inválido',
                text: 'Por favor, insira um email válido.'
            });
            return;
        }

        if (telefone === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Telefone".'
            });
            return;
        }

        if (senha === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Senha".'
            });
            return;
        } else if (senha.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Senha Curta',
                text: 'A senha deve ter pelo menos 6 caracteres.'
            });
            return;
        }

        if (repetirSenha === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Repetir Senha".'
            });
            return;
        } else if (senha !== repetirSenha) {
            Swal.fire({
                icon: 'error',
                title: 'Senhas Não Coincidem',
                text: 'As senhas inseridas não são iguais.'
            });
            return;
        }

        if (celular === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Celular".'
            });
            return;
        }

        if (whatsapp === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "WhatsApp".'
            });
            return;
        }

        if (cpf === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "CPF".'
            });
            return;
        }

        if (cep === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "CEP".'
            });
            return;
        }

        if (rua === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Rua".'
            });
            return;
        }

        if (bairro === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Bairro".'
            });
            return;
        }

        if (numero === '') {
            Swal.fire({
                icon: 'error',
                title: 'Campo Obrigatório',
                text: 'Por favor, preencha o campo "Número".'
            });
            return;
        }

        if (!aceitouTermos) {
            Swal.fire({
                icon: 'error',
                title: 'Termos de Uso',
                text: 'Você deve aceitar os Termos e Políticas de Privacidade.'
            });
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: 'Cadastro realizado com sucesso!',
            confirmButtonText: 'OK'
        }).then(() => {
            this.submit();
        });
    });

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

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
});
