<!DOCTYPE html>
<html lang="pt-br">
<head>

    <!-- Título da Página - SEO -->
    <title>Entre em sua conta rapidamente em procure por serviço que melhor lhe atendem | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Acesse sua conta no Trabalho Amigo e conecte-se com freelancers e serviços de forma rápida e segura." />

    <!-- Metas tags de configurações das páginas -->
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    
    <!-- Importação do Icone do Projeto -->
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">

    <!-- Tags Globais do projeto -->
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">

    <!-- Tags Especificas de cada página-->
    <link rel="stylesheet" href="../../../../public/css/global/Acesso.css">
    <script src="../../../../public/js/anunciante/login.js" defer></script>

    <!-- Importação da bibliotecas -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

</head>

<body>
        <script>
            $.ajax({
                url: `../../../controllers/anunciante/SecurityLogin.php`,
                method: 'GET',
                success: function (data) {
                    if (data == 'contratante') {
                        window.location.href = "../PaginaInicial/";
                    } else if (data == 'anunciante') {
                        window.location.href = "../PaginaInicial/";
                    }
                },
                error: function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro na Autenticação.'
                    });
                }
            });
        </script>

        <section class="bloco-login">
            <figure class="bloco-imagem">
                <img src="../../../../public/img/EntrarUsuario/business-worldwide-connectivity-ux8btm9o1laugnr1.jpg" alt="Imagem Banner de Login" class="imagem">
            </figure> 
            <section class="bloco-form">
                <div class="up-fixed">
                    <header class="bloco-form-header">
                        <figure class="form-header-figure">
                            <img width="40px" src="../../../../public/img/logo/favicon.ico" alt="Iagem Logo">
                        </figure>
                        <span class="header-figure-titulo">Trabalhoamigo</span>
                    </header>
                    <form id="FormEntrarUsuario" class="bloco-form-content">
                        <header class="form-content-header">
                            <span class="content-header-titulo">Área do anunciante</span>
                        </header>
                        <main class="content-form">
                            <article class="item-group-form">
                                <label for="input_email">E-mail</label>
                                <input class="input email" type="email" name="email" id="input_email" placeholder="Digite seu email" autocomplete="true">
                            </article>
                            <article class="item-group-form">
                                <label for="input_senha">Senha</label>
                                <input class="input senha" type="password" name="senha" id="input_senha" placeholder="Digite sua senha" autocomplete="false">
                                <div class="input_senha_eye">
                                    <i id="hide_icon_input_Senha" class="bi bi-eye-slash-fill hidden"></i>
                                    <i id="show_icon_input_Senha" class="bi bi-eye-fill"></i>
                                </div>
                            </article>
                            <article class="row-item-group-form">
                                <a href="../EsqueciMinhaSenha/" class="link-item-form">Esqueci minha senha</a>
                            </article>
                            <button type="submit" class="button-send-form anunciante">Entrar</button>
                            <hr class="separator-item-form">
                            <article class="row-item-group-form-left">
                                <span class="description-row-item-form">
                                    Não tem uma conta?
                                    <a href="../CriarConta/" class="link-item-form">Inscreva-se agora</a>
                                </span>
                            </article>
                            <article class="row-item-group-form-left">
                                <a class="button_other_option anunciante" href="../../contratante/EntrarConta/">Quero contratar serviços</a>
                            </article>
                        </main>
                    </form>
                </div>
                <footer class="bloco-form-footer">
                    <span class="form-footer-copy">
                        © TrabalhoAmigo2024
                    </span>
                </footer>
            </section>           
        </section>
        
        <div class="background-loading-50 hidden">
                <div class="loading-icon"></div>
        </div>

        <!-- Bootstrap JS -->
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    </body>
</html>