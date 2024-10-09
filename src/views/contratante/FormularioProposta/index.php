<?php

if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int) $_GET['id'];
} else {
    header('Location: ../ListagemServico/');
    exit();
}

?>



<!DOCTYPE html>
<html lang="pt-br">

<head>

    <!-- Tituloda Página - SEO -->
    <title> | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Crie sua Conta">

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
    <link rel="stylesheet" href="../../../../public/css/contrante/FormularioProposta.css">

    <script src="../../../../public/js/contratante/Formularioproposta.js" defer></script>

    <!-- Importação da bibliotecas -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

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

<body>
    <section id="ListagemServico">
        <div class="d-flex-swap">
            <a href="../ListagemServico/">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/></svg>
                Voltar para a listagem
            </a>
        </div>
        <div class="container">
            <div class="form-container">
                <form action="enviar_proposta.php" method="POST">
                    <div class="form-group">
                        <label for="valor">Valor da Proposta:</label>
                        <input type="number" id="valor" name="valor" required>
                    </div>

                    <div class="form-group">
                        <label for="descricao">Descrição da Proposta:</label>
                        <textarea id="descricao" name="descricao" rows="4" required></textarea>
                    </div>

                    <div class="form-group">
                        <label for="tempo">Tempo Estimado (dias):</label>
                        <input type="number" id="tempo" name="tempo" required>
                    </div>

                    <div class="form-group">
                        <label for="data_servico">Data Esperada para o Serviço:</label>
                        <input type="date" id="data_servico" name="data_servico" required>
                    </div>
                </form>
            </div>

            <div class="service-info">
                <h2>Informações do Serviço</h2>
                <p class="text-style"><strong>Título:</strong> Desenvolvimento de Website</p>
                <p class="text-style"><strong>Descrição:</strong> Criação de um site responsivo com integração de e-commerce.</p>
                <p class="text-style"><strong>Preço:</strong> R$ 5.000,00</p>
                <p class="text-style"><strong>Anunciante:</strong> João da Silva</p>
                <p class="text-style"><strong>Endereço:</strong> Rua dos Programadores, 123, São Paulo - SP</p>

                <button type="submit" form="propostaForm">Enviar Proposta</button>
            </div>
        </div>
    </section>
</body>

</html>