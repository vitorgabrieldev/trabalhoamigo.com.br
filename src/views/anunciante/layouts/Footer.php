<!-- =================================      RODAPÉ      =================================-->
<footer id="site-rodape">
    <section class="topo-rodape">
        <img width="40px" height="40px" class="logo" src="../../../../public/img/logo/favicon.ico" alt="Logo Rodapé">
        <nav class="navigation-social">
            <img src="../../../../public/img/instagram.png" alt="Icone Instagram">
            <img src="../../../../public/img/whatsapp.png" alt="Icone Whatsapp">
            <img src="../../../../public/img/github.png" alt="Icone Github">
        </nav>
    </section>
    <hr class="bar-long">
    <div class="row-grid-rodape">
        <div class="item">
            <h1 class="titulo">LINKS RÁPIDOS</h1>
            <div class="list-itens">
                <a class="itens-links" onclick="showModalRodape('linksRapidos', 'Como funciona')">Como funciona</a>
                <a class="itens-links" onclick="showModalRodape('linksRapidos', 'Termos de serviço')">Termos de serviço</a>
                <a class="itens-links" onclick="showModalRodape('linksRapidos', 'Contato')">Contato</a>
                <a class="itens-links" onclick="showModalRodape('linksRapidos', 'Política do trabalho amigo')">Política do trabalho amigo</a>
                <a class="itens-links" onclick="showModalRodape('linksRapidos', 'Cookies')">Cookies</a>
                <a class="itens-links" onclick="showModalRodape('linksRapidos', 'Configuração de cookies')">Configuração de cookies</a>
            </div>
        </div>
        <div class="item">
            <h1 class="titulo">AJUDA</h1>
            <div class="list-itens">
                <a class="itens-links" onclick="showModalRodape('ajuda', 'Centro de ajuda')">Centro de ajuda</a>
                <a class="itens-links" onclick="showModalRodape('ajuda', 'Novidades')">Novidades</a>
                <a class="itens-links" onclick="showModalRodape('ajuda', 'Documentação')">Documentação</a>
                <a class="itens-links" onclick="showModalRodape('ajuda', 'Bugs')">Bugs</a>
                <a class="itens-links" onclick="showModalRodape('ajuda', 'Faça uma pergunta')">Faça uma pergunta</a>
            </div>
        </div>
        <div class="item"></div>
        <div class="item">
            <h1 class="titulo">FALE CONOSCO</h1>
            <div class="list-itens">
                <a class="itens-links" onclick="showModalRodape('faleConosco', '+55 (43) 98487-3806')">+55 (43) 98487-3806</a>
                <a class="itens-links" onclick="showModalRodape('faleConosco', 'suport@trabalhoamigo.com.br')">suport@trabalhoamigo.com.br</a>
                <a class="itens-links" onclick="showModalRodape('faleConosco', 'admin@trabalhoamigo.com.br')">admin@trabalhoamigo.com.br</a>
            </div>
        </div>
    </div>
    <hr class="bar-long">
    <div class="d-flex-footer">
        <h3 class="copy">Copyright 2023-2024 - Trabalhoamigo.com.br</h3>
    </div>
</footer>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js"></script>

<script>
function showModalRodape(categoria, titulo) {
    let conteudo;

    switch (categoria) {
        case 'linksRapidos':
            conteudo = getLinksRapidosContent(titulo);
            break;
        case 'ajuda':
            conteudo = getAjudaContent(titulo);
            break;
        case 'faleConosco':
            conteudo = getFaleConoscoContent(titulo);
            break;
        default:
            conteudo = "<p>Informação não disponível.</p>";
            break;
    }

    Swal.fire({
        title: titulo,
        html: conteudo,
        icon: 'info',
        confirmButtonText: 'Fechar',
    });
}

function getLinksRapidosContent(titulo) {
    switch (titulo) {
        /*------------------------------------
        | Seção: Links Rápidos - Como Funciona
        |------------------------------------*/
        case 'Como funciona':
            return `
                <p style="margin-bottom: 20px;">Aqui está uma explicação sobre como nossa plataforma funciona. 
                Veja abaixo o vídeo explicativo ou acesse nosso <a href="/faq">FAQ</a> para mais detalhes.</p>
                <video controls width="100%">
                    <source src="/videos/como-funciona.mp4" type="video/mp4">
                    Seu navegador não suporta a tag de vídeo.
                </video>`;

        /*------------------------------------
        | Seção: Links Rápidos - Termos de Serviço
        |------------------------------------*/
        case 'Termos de serviço':
            return `
                <p>Leia nossos <a href="/termos">termos de serviço</a> para entender suas obrigações e direitos ao usar nossa plataforma.</p>
                <p><a href="/termos" target="_blank">Ver Termos de Serviço Completo</a></p>`;

        /*------------------------------------
        | Seção: Links Rápidos - Política do Trabalho Amigo
        |------------------------------------*/
        case 'Política do trabalho amigo':
            return `
                <p>Confira nossa <a href="/politica-trabalho-amigo">Política do Trabalho Amigo</a> para entender nossos valores e práticas em apoio aos colaboradores.</p>
                <p><a href="/politica-trabalho-amigo" target="_blank">Ver Política Completa</a></p>`;

        /*------------------------------------
        | Seção: Links Rápidos - Cookies
        |------------------------------------*/
        case 'Cookies':
            return `
                <p>Utilizamos cookies para melhorar sua experiência em nosso site. Para saber mais sobre como usamos cookies, leia nossa <a href="/politica-cookies">Política de Cookies</a>.</p>
                <p><a href="/politica-cookies" target="_blank">Ver Política de Cookies Completa</a></p>`;

        /*------------------------------------
        | Seção: Links Rápidos - Configuração de Cookies
        |------------------------------------*/
        case 'Configuração de cookies':
            return `
                <p>Gerencie suas configurações de cookies para uma experiência personalizada:</p>
                <form method="post">
                    <label><input type="checkbox" name="cookies_necessarios" checked disabled> Cookies Necessários</label><br>
                    <label><input type="checkbox" name="cookies_analiticos"> Cookies Analíticos</label><br>
                    <label><input type="checkbox" name="cookies_marketing"> Cookies de Marketing</label><br>
                    <button type="submit">Salvar Preferências</button>
                </form>`;

        default:
            return "<p>Informação não disponível.</p>";
    }
}

function getAjudaContent(titulo) {
    switch (titulo) {
        /*------------------------------------
        | Seção: Ajuda - Centro de Ajuda
        |------------------------------------*/
        case 'Centro de ajuda':
            return `
                <p>Visite nosso <a href="/centro-de-ajuda">Centro de Ajuda</a> para obter suporte e informações detalhadas sobre nossos serviços.</p>
                <p><a href="/centro-de-ajuda" target="_blank">Ir para o Centro de Ajuda</a></p>`;

        /*------------------------------------
        | Seção: Ajuda - Novidades
        |------------------------------------*/
        case 'Novidades':
            return `
                <p>Fique por dentro das novidades e atualizações do nosso serviço, além de eventos e melhorias.</p>
                <p><a href="/novidades" target="_blank">Ver Novidades Recentes</a></p>`;

        /*------------------------------------
        | Seção: Ajuda - Documentação
        |------------------------------------*/
        case 'Documentação':
            return `
                <p>Acesse nossa <a href="/documentacao">documentação</a> para desenvolvedores e usuários, com guias completos e exemplos.</p>
                <p><a href="/documentacao" target="_blank">Ir para Documentação</a></p>`;

        /*------------------------------------
        | Seção: Ajuda - Bugs
        |------------------------------------*/
        case 'Bugs':
            return `
                <p>Se você encontrou um bug, por favor, preencha o formulário abaixo para reportar.</p>
                <form action="/reportar-bug" method="post">
                    <label>Descrição do Bug:</label><br>
                    <textarea name="descricao" required></textarea><br>
                    <label>Seu e-mail para contato:</label><br>
                    <input type="email" name="email" required><br>
                    <button type="submit">Enviar</button>
                </form>`;

        /*------------------------------------
        | Seção: Ajuda - Faça uma Pergunta
        |------------------------------------*/
        case 'Faça uma pergunta':
            return `
                <p>Sinta-se à vontade para fazer uma pergunta e esclarecer suas dúvidas através do formulário abaixo.</p>
                <form action="/fazer-pergunta" method="post">
                    <label>Sua pergunta:</label><br>
                    <textarea name="pergunta" required></textarea><br>
                    <label>Seu e-mail para contato:</label><br>
                    <input type="email" name="email" required><br>
                    <button type="submit">Enviar</button>
                </form>`;

        default:
            return "<p>Informação não disponível.</p>";
    }
}

function getFaleConoscoContent(titulo) {
    switch (titulo) {
        /*------------------------------------
        | Seção: Fale Conosco - Telefone
        |------------------------------------*/
        case '+55 (43) 98487-3806':
            return `
                <p>Ligue para nós durante o horário comercial para tirar dúvidas ou solicitar suporte.</p>
                <p>Telefone: <a href="tel:+5543984873806">+55 (43) 98487-3806</a></p>`;

        /*------------------------------------
        | Seção: Fale Conosco - E-mail de Suporte
        |------------------------------------*/
        case 'suport@trabalhoamigo.com.br':
            return `
                <p>Envie um e-mail para nossa equipe de suporte.</p>
                <p>E-mail: <a href="mailto:suport@trabalhoamigo.com.br">suport@trabalhoamigo.com.br</a></p>`;

        /*------------------------------------
        | Seção: Fale Conosco - E-mail de Administração
        |------------------------------------*/
        case 'admin@trabalhoamigo.com.br':
            return `
                <p>Entre em contato com a administração pelo e-mail abaixo:</p>
                <p>E-mail: <a href="mailto:admin@trabalhoamigo.com.br">admin@trabalhoamigo.com.br</a></p>`;

        default:
            return "<p>Informação não disponível.</p>";
    }
}
</script>
