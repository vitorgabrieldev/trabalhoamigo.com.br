<!DOCTYPE html>
<html lang="pt-br">
<head>

    <!-- Título da Página - SEO -->
    <title>Trabalho Amigo | Conecte-se a Freelancers e Encontre Serviços de Qualidade</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Bem-vindo ao Trabalho Amigo! Crie sua conta gratuita e conecte-se a freelancers para compartilhar e contratar serviços de forma rápida e eficiente." />

    <!-- Metas tags de configurações das páginas -->
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    
    <!-- Importação do Icone do Projeto -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon">

    <!-- Tags Globais do projeto -->
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">

    <!-- Tags Especificas de cada página-->
    <link rel="stylesheet" href="../../../../public/css/contrante/PaginaInicial.css">
    <script src="../../../../public/js/contratante/Home.js" defer></script>

    <!-- Importação da bibliotecas -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css"/>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css" />
    <script src="https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.umd.js" defer></script>

    <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

<body>

    <script>
        $.ajax({
            url: `../../../controllers/contratante/Security.php`,
            method: 'GET',
            success: function (data) {
                if (data == 'true') {
                } else if (data == 'false') {
                    window.location.href = "../CriarConta/";
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

    <?php include '../layouts/Header.php'; ?>

    <main id="content">
        <section id="bloco-banner">
            <div class="absolute-text">
                <h3 class="descricaoBanner">
                    Milhares de opções de serviços gratuitos na palma da sua mão, clique em saiba e venha conferir!
                </h3>
                <a href="../ListagemServico/" id="saibamais" class="link-saibamais">SAIBA MAIS</a>
            </div>
            <img src="../../../../public/img/Bloco-banner.png" alt="Banner">
        </section>

        <section id="bloco-comoFunciona">
            <div class="conteudo">
                <h1 class="titulo">COMO FUNCIONA</h1>
                <p class="descricao-bloco">Veja abaixo como é simples e rápido achar o serviço que melhor lhe atende na trabalho amigo</p>
            </div>
            <div class="steep">
                <div class="item">
                    <img src="../../../../public/img/Steep-1.png" alt="Passo a Passo">
                    <h1 class="titulo-steep">Procure um serviço</h1>
                    <p class="descricap-steep">Escolha o serviço que melhor atender suas necessidades</p>
                </div>
                <div class="item">
                    <img src="../../../../public/img/Steep-2.png" alt="Passo a Passo">
                    <h1 class="titulo-steep">Envie sua proposta</h1>
                    <p class="descricap-steep">Faça uma proposta para o anunciante e espere ele responder</p>
                </div>
                <div class="item">
                    <img src="../../../../public/img/Steep-3.png" alt="Passo a Passo">
                    <h1 class="titulo-steep">Aguarde sua resposta</h1>
                    <p class="descricap-steep">Aguarde até a proposta ser aceita e entre em contato com o anunciante pelos contatos liberados.</p>
                </div>  
            </div>
        </section>

        <section class="scrollSmoth" id="bloco-video">
            <div class="conteudo">
                <h1 class="titulo">SAIBA MAIS</h1>
                <br>
                <p class="descricao-bloco">Venha conhecer mais sobre nossa plataforma!</p>
            </div>
            <div class="iframeVideo">
                <a data-fancybox="gallery" href="https://www.youtube.com/watch?v=NpEaa2P7qZI">
                    <div id="play_button" class="play-button">
                        <img src="../../../../public/img/Bloco-video-play.png" alt="Play Button">
                    </div>
                </a>
                <img src="../../../../public/img/Bloco-video-image.png" alt="Imagem Default Video">
            </div>
        </section>

        <section id="bloco-chamadaServico">
            <h1 class="titulo">VENHA CONFERIR OS SERVIÇOS DISPONÍVEIS</h1>
            <a class="button" href="../ListagemServico/">
                SERVIÇOS
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                </svg>
            </a>
        </section>
    </main>

    <?php include '../layouts/Footer.php'; ?>

</body>
</html>