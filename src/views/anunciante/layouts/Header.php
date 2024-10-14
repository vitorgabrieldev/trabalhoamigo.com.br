
<?php

if (!isset($_SESSION)) {
    session_start();
}

?>

<section id="popup-profile">
    <header class="topo-popup-profile">
        <img width="40px" height="40px" class="logo" src="../../../../public/img/logo/favicon.ico" alt="Logo Rodapé">
        <h2 class="name-user"><?php echo isset($_SESSION['primeiro_nome']) ? $_SESSION['primeiro_nome'] : 'NotFound 404'; ?></h2>

    </header>
    <hr class="small-line">
    <div class="list-links">
        <a class="link DispathAlert" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
            </svg>
            Meu Perfil
        </a>
        <a class="link DispathAlert" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-gear-fill" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
            </svg>
            Configurações
        </a>
        <a class="link DispathAlert" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
            </svg>
            Ajuda
        </a>
    </div>
    <hr class="small-line">
    <a onclick="Logout()" class="link link-child-logout" href="#">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-door-open-fill" viewBox="0 0 16 16">
            <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"/>
        </svg>
        SAIR
    </a>
</section>

<header id="site-topo">
    <a href="../PaginaInicial/">
        <div class="logo-box">
            <img width="40px" height="40px" class="logo" src="../../../../public/img/logo/favicon.ico" alt="Logo Rodapé">
        </div>
    </a>
    <nav class="navigation-box">
        <div class="links-box">
            <a class="link-element" href="../CadastroServico/">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/></svg>
                Criar Serviço
            </a>
            <a class="link-element" href="../ListagemProposta/">
                <img src="../../../../public/img/Icon-document.png" alt="Icon Propostas">
                Propostas
            </a>
            <a class="link-element" href="#" onclick="toggleNotifications()">
                <img src="../../../../public/img/Icon-notification.png" alt="Icon Notificações">
                Notificações
            </a>
        </div>
        <div class="userProfile-circle">
            <img src="../../../../public/img/UserProfile-default.png" alt="Imagem de Usuário Padrão">
            <img src="../../../../public/img/Topo-User-More.png" alt="Btn Mais informações">
        </div>
        <div class="openMenuTopo menu-mobile">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
        </div>
    </nav>
</header>

<!-- ================================================================================== -->

<div id="notification-dropdown" class="notification-dropdown" style="display:none;">
    <ul>
        <li>
            <p>Você recebeu uma nova proposta!</p>
            <span class="notification-time">10:30 AM</span>
        </li>
        <li>
            <p>Os acessos ao seus serviços subiram em 49% durante esse mês.</p>
            <span class="notification-time">9:15 AM</span>
        </li>
        <li>
            <p>Confira as notas de atualizações.</p>
            <span class="notification-time">8:45 AM</span>
        </li>
    </ul>
</div>


<script>
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}
</script>