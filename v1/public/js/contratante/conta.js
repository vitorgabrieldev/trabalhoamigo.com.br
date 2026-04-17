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

        $(".background-loading-50").removeClass('hidden');

        $.ajax({
            url: '../../../controllers/contratante/CreateAccount.php',
            type: 'POST',
            data: formData, 
            success: function (response) {
                $(".SendForm").html("Cadastrar");
                $(".background-loading-50").addClass('hidden');

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
                $(".background-loading-50").addClass('hidden');
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
    if (cep.length >= 1) {
        if (cep.length === 8) {

            $(".background-loading-50").removeClass('hidden');

            $.ajax({
                url: `https://viacep.com.br/ws/${cep}/json/`,
                method: 'GET',
                success: function (data) {
                    $(".background-loading-50").addClass('hidden');
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
                    }
                },
                error: function () {
                    $(".background-loading-50").addClass('hidden');
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
    }
});

/*------------------------------------------------------
*  Sistema de exibição de politicas de privacidade
* ----------------------------------------------------- */
document.getElementById('privacy-policy-btn').addEventListener('click', function() {
    Swal.fire({
        title: 'Política de Privacidade',
        html: `
            <div style="text-align: left;">
                <p><strong>1. Coleta de Informações:</strong> Coletamos informações pessoais fornecidas por você, como nome, e-mail, e dados de contato, bem como informações sobre o serviço que você compartilha na plataforma.</p><br>
                <p><strong>2. Uso das Informações:</strong> Utilizamos as informações para facilitar a comunicação entre usuários, melhorar a experiência na plataforma e garantir a segurança dos serviços compartilhados. Seus dados podem ser usados para envio de notificações relacionadas à plataforma.</p><br>
                <p><strong>3. Compartilhamento de Dados:</strong> Compartilhamos suas informações apenas com os usuários relevantes para a execução dos serviços oferecidos ou solicitados. Não vendemos suas informações a terceiros.</p><br>
                <p><strong>4. Segurança:</strong> Implementamos medidas de segurança para proteger suas informações, como criptografia e monitoramento de atividades suspeitas.</p><br>
                <p><strong>5. Seus Direitos:</strong> Você tem o direito de acessar, corrigir ou excluir suas informações pessoais a qualquer momento, além de poder solicitar a interrupção do uso dos seus dados.</p><br>
                <p><strong>6. Alterações na Política:</strong> Esta política de privacidade pode ser atualizada a qualquer momento. Recomendamos a leitura periódica desta página para manter-se informado.</p><br>
                <p><strong>Contato:</strong> Para dúvidas ou solicitações sobre a política de privacidade, entre em contato conosco pelo e-mail suporte@trabalhoamigo.com.</p>
            </div>
        `,
        icon: 'info',
        showCloseButton: true,
        showCancelButton: false,
        focusConfirm: true,
        confirmButtonText: 'Fechar!',
        width: '600px',
        padding: '3em',
    });
});

/*------------------------------------------------------
*  Sistema de exibição de Termos de uso
* ----------------------------------------------------- */
document.getElementById('termos-btn').addEventListener('click', function() {
    Swal.fire({
        title: 'Termos de Uso',
        html: `
            <div style="text-align: left;">
                <p><strong>1. Aceitação dos Termos:</strong> Ao utilizar nossa plataforma, você concorda em cumprir estes termos. Caso não concorde com qualquer parte dos termos, você não deve utilizar a plataforma.</p><br>
                <p><strong>2. Uso da Plataforma:</strong> Nossa plataforma é destinada ao compartilhamento de serviços entre comunidades. Você concorda em usar a plataforma de maneira responsável e respeitosa, sem violar leis ou direitos de terceiros.</p><br>
                <p><strong>3. Responsabilidade pelos Conteúdos:</strong> Você é responsável por todo conteúdo ou informação que compartilhar na plataforma. Isso inclui a veracidade e a legalidade das informações postadas.</p><br>
                <p><strong>4. Propriedade Intelectual:</strong> O conteúdo da plataforma, incluindo textos, gráficos e logos, é protegido por direitos autorais. Você não pode reproduzir ou utilizar qualquer parte do conteúdo sem nossa permissão expressa.</p><br>
                <p><strong>5. Modificações dos Termos:</strong> Podemos modificar estes termos a qualquer momento. Recomendamos que você revise os termos periodicamente para estar ciente de quaisquer alterações.</p><br>
                <p><strong>6. Suspensão de Conta:</strong> Reservamo-nos o direito de suspender ou encerrar a sua conta caso haja violação dos termos ou uso indevido da plataforma.</p><br>
                <p><strong>7. Contato:</strong> Para dúvidas ou esclarecimentos sobre os Termos de Uso, entre em contato conosco pelo e-mail suporte@trabalhoamigo.com.</p>
            </div>
        `,
        icon: 'info',
        showCloseButton: true,
        showCancelButton: false,
        focusConfirm: true,
        confirmButtonText: 'Fechar!',
        width: '600px',
        padding: '3em',
    });
});