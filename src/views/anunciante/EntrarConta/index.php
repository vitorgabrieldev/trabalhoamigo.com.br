<!DOCTYPE html>
<html lang="pt-br">
<head>

    <!-- Título da Página - SEO -->
    <title>Entre em sua Conta rapidamente e Conecte-se com Freelancers | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Crie sua conta gratuitamente no Trabalho Amigo e comece a conectar-se com freelancers para compartilhar e contratar serviços de forma prática e eficiente." />

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

    <style>
        body {
            overflow-y: hidden;
        }
    </style>
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

        <section id="EntrarContaUsuario">
            <div class="left">
                </header>
                <main class="corpo">
                    <section class="content-titulo">
                        <div>
                            <img width="60px" src="../../../../public/img/logo/favicon.ico" alt="Logo Trabalho Amigo">
                        </div>
                        <h1 class="titulo color-blue">Entrar como Anunciante</h1>
                        <p class="descricao">Gerencie seus anúncios e conquiste novos clientes 🚀</p>
                    </section>
                    <form id="FormEntrarUsuario">
                        <section class="inputGroup">
                            <div class="input-group">
                                <input required="" type="text" name="text" autocomplete="off" class="input email">
                                <label class="user-label">Email</label>
                                <h4 class="errorMessage errorMessageEmail hidden">Preencha corretamente este campo!</h4>
                            </div>
                            <div class="input-group">
                                <input required="" type="password" name="text" autocomplete="off" class="input senha">
                                <label class="user-label">Senha</label>
                                <a href="../EsqueciMinhaSenha/" class="esqueci_senha">Esqueci minha senha</a>
                                <h4 class="errorMessage errorMessageSenha hidden">Preencha corretamente este campo!</h4>
                            </div>
                        </section>
                        <br>                        
                        <div class="rowBtn">
                            <button type="submit" class="SendForm background-blue">    
                                Acessar sua conta
                            </button>
                        </div>
    
                        <section class="NoLogin">
                            <h2 class="titulo">Não tem cadastro? <a href="../CriarConta/index.html" class="link color-blue">Cadastre-se gratuitamente</a></h2>
                        </section>
                    </form>
                    <div class="SouAnunciante">
                        <h2 class="titulo">Outras opções de entrada</h2>
                        <a class="buttonLinkAnunciante background-light-blue" href="../../contratante/EntrarConta/">QUERO CONTRATAR SERVIÇOS</a>
                    </div>
                </main>
            </div>
            
            <div class="background-loading-50 hidden">
                <div class="loading-icon"></div>
            </div>
        </section>


    </body>
</html>