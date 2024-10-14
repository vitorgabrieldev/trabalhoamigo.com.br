<?php

if (!isset($_SESSION)) {
    session_start();
}

// Conexão com o banco de dados
define('DB_SERVER', '185.173.111.184');
define('DB_USERNAME', 'u858577505_trabalhoamigo');
define('DB_PASSWORD', '@#Trabalhoamigo023@_');
define('DB_NAME', 'u858577505_trabalhoamigo');

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verificação da conexão
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$id_usuario = $_SESSION['id_usuario'];

// Consulta SQL para buscar propostas e dados do prestador
$sql = "SELECT p.id_contrato, DATE(p.data_contrato) AS data_envio, s.titulo AS titulo_servico, p.valor_total, p.status, 
               u.primeiro_nome, u.telefone, u.celular, u.whatsapp, u.email
        FROM proposta p 
        JOIN servicos s ON p.id_servico_fk = s.id_servico 
        JOIN usuarios u ON p.id_usuario_prestador_fk = u.id_usuario 
        WHERE p.id_usuario_contrante_fk = ?";


$stmt = $conn->prepare($sql);

// Adiciona verificação de erro
if ($stmt === false) {
    die("Erro na preparação da consulta: " . $conn->error);
}

$stmt->bind_param("i", $id_usuario);

// Executa a consulta
$stmt->execute();
$result = $stmt->get_result();

// Busca os dados
$propostas = $result->fetch_all(MYSQLI_ASSOC);

// Libera os recursos
$stmt->close();
$conn->close();
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <!-- Tituloda Página - SEO -->
    <title>Histórico de Propostas | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Crie sua Conta">
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">
    <link rel="stylesheet" href="../../../../public/css/contrante/HistoricoProposta.css">
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>

<body>
    <section id="ListagemServico">
        <h3><a href="../PaginaInicial/">←</a> Histórico de propostas</h3>
        <div class="grid-container">
            <div class="grid-header">ID</div>
            <div class="grid-header">Data de envio</div>
            <div class="grid-header">Título do Serviço</div>
            <div class="grid-header">Valor</div>
            <div class="grid-header">Status</div>

            <?php foreach ($propostas as $proposta): ?>
                <div class="grid-item"><?= $proposta['id_contrato'] ?></div>
                <div class="grid-item"><?= $proposta['data_envio'] ?></div>
                <div class="grid-item"><?= $proposta['titulo_servico'] ?></div>
                <div class="grid-item">R$ <?= number_format($proposta['valor_total'], 2, ',', '.') ?></div>
                <div class="grid-item">
                    <?php
                    switch ($proposta['status']) {
                        case 1:
                            echo '<button class="button-espera">Em espera</button>';
                            break;
                        case 2:
                            // Use o id do contrato para o modal
                            $idServico = $proposta['id_contrato']; 
                            
                            // Renderiza o botão
                            echo '<button class="button" onclick="openModalAceito(' . $idServico . ')">Aceito <i class="bi bi-arrow-right-short"></i></button>';
                            
                            // Renderiza o modal
                            echo '
                            <div id="modalServico' . $idServico . '" class="modal">
                                <div class="modal-content">
                                    <div class="flex-modal">
                                        <h2 class="titulo-modal">Informações de Contato do Prestador</h2>
                                        <span class="close" onclick="closeModalAceito(' . $idServico . ')">&times;</span>
                                    </div>
                                    <p><strong>Nome:</strong> ' . $proposta['primeiro_nome'] . '</p>
                                    <p class="cursor-pointer" onclick="copyToClipboard(\'' . $proposta['telefone'] . '\')"><strong>Telefone:</strong> ' . $proposta['telefone'] . '</p>
                                    <p class="cursor-pointer" onclick="copyToClipboard(\'' . $proposta['celular'] . '\')"><strong>Celular:</strong> ' . $proposta['celular'] . '</p>
                                    <p class="cursor-pointer" onclick="copyToClipboard(\'' . $proposta['whatsapp'] . '\')"><strong>WhatsApp:</strong> ' . $proposta['whatsapp'] . '</p>
                                    <p class="cursor-pointer" onclick="copyToClipboard(\'' . $proposta['email'] . '\')"><strong>Email:</strong> ' . $proposta['email'] . '</p>
                                </div>
                            </div>
                            ';
                            break;
                        case 3:
                            echo '<button class="button-finalizado">Finalizado</button>';
                            break;
                        case 4:
                            echo '<button class="button-finalizado">Cancelado</button>';
                            break;
                        default:
                            echo '<button class="button">ERROR</button>';
                    }
                    ?>
                </div>
            <?php endforeach; ?>
        </div>
    </section>

    <div id="toast" class="toast" style="display: none;">
        <div class="toast-body">
            Copiado para a área de transferência!
        </div>
    </div>

</body>
</html>

<script>
function openModalAceito(idServico) {
    document.getElementById('modalServico' + idServico).style.display = 'block';
}

function closeModalAceito(idServico) {
    document.getElementById('modalServico' + idServico).style.display = 'none';
}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast();
    }, function(err) {
        console.error('Erro ao copiar: ', err);
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
</script>

