// Funções de validação modular

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
 * Valida se a senha tem pelo menos 6 caracteres.
 * @param {string} senha - A senha a ser validada.
 * @return {boolean} - Retorna true se a senha for válida.
 */
function validarSenha(senha) {
    return senha.length >= 6;
}

// Função principal de validação

/**
 * Função que valida todos os dados do formulário de login.
 * @param {object} formData - Um objeto contendo os dados do formulário de login.
 * @return {Array} - Retorna um array de mensagens de erro, se houver.
 */
function validarDadosLogin(formData) {
    let erros = [];

    if (!validarEmail(formData.email)) erros.push("Email inválido");
    if (!validarSenha(formData.senha)) erros.push("Senha deve ter pelo menos 6 caracteres");

    return erros;
}


$('#FormEntrarUsuario').on('submit', function (e) {
    e.preventDefault(); 

    let formData = {
        email: $('.input.email').val().trim(), 
        senha: $('.input.senha').val().trim() 
    };

    let erros = validarDadosLogin(formData); 

    if (erros.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Erro de Validação',
            text: 'Verifique os campos e tente novamente.',
            footer: erros.join('<br>')
        });
    } else {

        // Ativa animação de loading
        $(".SendForm").html(`<section class="loading-container"><div class='loading-form-animation'></div></section>`);

        $.ajax({
            url: '../../../controllers/contratante/LoginAccount.php',
            type: 'POST',
            data: formData,
            success: function (response) {
                
                // Desativa animação de loading
                $(".SendForm").html("Acessar sua conta");

                if (response.success) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Aguarde enquanto configuramos seu acesso...",
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                        willClose: () => {
                          window.location.href = '../PaginaInicial/';
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro de Login',
                        text: response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                
                // Desativa animação de loading
                $(".SendForm").html("Acessar sua conta");

                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um erro. Tente novamente.'
                });
            }
        });
    }
});
