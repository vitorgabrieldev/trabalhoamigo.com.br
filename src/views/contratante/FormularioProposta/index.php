<?php

// Definir constantes para os detalhes da conexão com o banco de dados
define('DB_SERVER', '185.173.111.184');
define('DB_USERNAME', 'u858577505_trabalhoamigo');
define('DB_PASSWORD', '@#Trabalhoamigo023@_');
define('DB_NAME', 'u858577505_trabalhoamigo');

// Função para criar a conexão com o banco de dados
function getDatabaseConnection() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

try {
    // Obter a conexão com o banco de dados
    $conn = getDatabaseConnection();

    // Verificar se o parâmetro 'id' está na URL e é numérico
    if (isset($_GET['id']) && is_numeric($_GET['id'])) {
        $id = (int)$_GET['id'];

        // Buscar as informações do serviço baseado no ID
        $sql = "SELECT s.titulo, s.descricao, s.preco, s.aceita_oferta, u.primeiro_nome, u.ultimo_nome, u.email, u.telefone
                FROM servicos s
                JOIN usuarios u ON s.id_usuario_fk = u.id_usuario
                WHERE s.id_servico = ?";
        $stmt = $conn->prepare($sql);

        // Se a preparação falhar, exibir o erro
        if ($stmt === false) {
            die('Erro na preparação da consulta: ' . $conn->error);
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        // Verificar se o serviço foi encontrado
        if ($result->num_rows > 0) {
            $servico = $result->fetch_assoc();
        } else {
            // Redirecionar para a listagem caso o serviço não seja encontrado
            header('Location: ../ListagemServico/');
            exit();
        }
    } else {
        // Redirecionar para a listagem caso o ID não seja válido
        header('Location: ../ListagemServico/');
        exit();
    }
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage();
}

?>

<!DOCTYPE html>
<html lang="pt-br">

<head>
    <title>Proposta de Serviço | Trabalho Amigo</title>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel="stylesheet" href="../../../../public/css/contrante/FormularioProposta.css">
    <script src="../../../../public/js/contratante/Formularioproposta.js" defer></script>
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/1.1.3/sweetalert.min.js"></script>
</head>

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

    <section id="ListagemServico">
        <div class="d-flex-swap">
            <a href="../ListagemServico/">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/>
                </svg>
                Voltar para a listagem
            </a>
        </div>
        <div class="container">
            <div class="form-container">
            <form id="FormProposta" method="POST">
                <?php if ($servico['aceita_oferta']) : ?>
                    <div class="form-group">
                        <label for="valor">Valor da Proposta:</label>
                        <input type="number" id="valor" name="valor">
                    </div>
                <?php endif; ?>

                <div class="form-group">
                    <label for="descricao">Descrição da Proposta:</label>
                    <textarea id="descricao" name="descricao" rows="4" required></textarea>
                    <input type="hidden" id="idservico" value="<?php echo $_GET['id'] ?>" name="idservico">
                </div>

                <div class="form-group">
                    <label for="tempo">Tempo Estimado (dias):</label>
                    <input type="number" id="tempo" name="tempo" required>
                </div>

                <div class="form-group">
                    <label for="data_servico">Data Esperada para o Serviço:</label>
                    <input type="date" id="data_servico" name="data_servico" required>
                </div>

                <button type="submit">Enviar Proposta</button>
            </form>

            <div id="mensagem"></div>
            </div>

            <div class="service-info">
                <h2>Informações do Serviço</h2>
                <p class="text-style"><strong>Título:</strong> <?php echo htmlspecialchars($servico['titulo']); ?></p>
                <p class="text-style"><strong>Descrição:</strong> <?php echo htmlspecialchars($servico['descricao']); ?></p>
                <p class="text-style"><strong>Preço:</strong> <?php echo $servico['preco'] == 0 ? '<b>Comunitário</b>' : 'R$ ' . number_format($servico['preco'], 2, ',', '.'); ?></p>
                <p class="text-style"><strong>Este serviço não aceita propostas.</strong></p>
                <p class="text-style"><strong>Anunciante:</strong> <?php echo htmlspecialchars($servico['primeiro_nome']) . ' ' . htmlspecialchars($servico['ultimo_nome']); ?></p>
                <p class="text-style"><strong>Email:</strong> <?php echo htmlspecialchars($servico['email']); ?></p>
                <p class="text-style"><strong>Telefone:</strong> <?php echo htmlspecialchars($servico['telefone']); ?></p>
            </div>
        </div>
    </section>

    <div class="background-loading-50 hidden">
        <div class="loading-icon"></div>
    </div>

    <?php include '../layouts/Footer.php'; ?>

</body>

</html>
