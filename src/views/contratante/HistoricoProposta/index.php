<?php
session_start();

require_once __DIR__ . '/../../../../config/config.php';

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verificação da conexão
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

trocarStatusNotificacoes($_SESSION['id_usuario'], "Sua proposta foi recusada", 1);
trocarStatusNotificacoes($_SESSION['id_usuario'], "Sua proposta foi aceita", 1);

// Buscar propostas
$id_usuario = $_SESSION['id_usuario'] ?? null;
if ($id_usuario) {
    $sql = "SELECT p.id_contrato, DATE(p.data_contrato) AS data_envio, s.titulo AS titulo_servico, 
                   p.valor_total, u.primeiro_nome, u.telefone, u.celular, u.whatsapp, u.email, u.unique_id,
                   p.prazo_estimado, p.data_esperada, p.status
            FROM proposta p 
            JOIN servicos s ON p.id_servico_fk = s.id_servico 
            JOIN usuarios u ON p.id_usuario_prestador_fk = u.id_usuario 
            WHERE p.id_usuario_contrante_fk = ? AND u.ativo = 1
            ORDER BY p.data_contrato DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id_usuario);
    $stmt->execute();
    $result = $stmt->get_result();
    $propostas = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
} else {
    $propostas = []; // Array vazio se não houver usuário logado
}

$conn->close();
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <!-- Título da Página - SEO -->
    <title>Histórico de Propostas | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Acesse o histórico de suas propostas enviadas e recebidas. Gerencie suas oportunidades de trabalho com facilidade no Trabalho Amigo." />
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">
    <link rel="stylesheet" href="../../../../public/css/contrante/HistoricoProposta.css">
    <script src="../../../../public/js/contratante/HistoricoProposta.js"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
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
        <h3><a href="../PaginaInicial/">←</a> Histórico de Propostas</h3>
        <div class="grid-container">
            <div class="grid-header">Data de Envio</div>
            <div class="grid-header">Título do Serviço</div>
            <div class="grid-header">Valor</div>
            <div class="grid-header">Ações</div>

            <?php foreach ($propostas as $proposta): ?>
                <div class="grid-item"><?= htmlspecialchars($proposta['data_envio']) ?></div>
                <div class="grid-item"><?= htmlspecialchars($proposta['titulo_servico']) ?></div>
                <div class="grid-item">R$ <?= number_format($proposta['valor_total'], 2, ',', '.') ?></div>
                <div class="grid-item">
                    <?php
                    // Definir a classe de status com base no valor
                    $statusClass = '';
                    $statusText = '';
                    switch ($proposta['status']) {
                        case 1:
                            $statusClass = 'status-aguardando';
                            $statusText = 'Aguardando';
                            break;
                        case 3:
                            $statusClass = 'status-finalizado';
                            $statusText = 'Finalizado';
                            break;
                        case 4:
                            $statusClass = 'status-recusado';
                            $statusText = 'Recusado';
                            break;
                        default:
                            $statusText = 'Desconhecido';
                            break;
                    }
                    ?>

                    <?php if ($proposta['status'] != 2): ?>
                        <span class="<?= $statusClass ?>">Status: <?= $statusText ?></span>
                    <?php endif; ?>

                    <?php if ($proposta['status'] == 2): ?>
                        <button class="button" onclick="showContractorInfo('<?= addslashes($proposta['primeiro_nome']) ?>','<?= addslashes($proposta['telefone']) ?>','<?= addslashes($proposta['celular']) ?>','<?= addslashes($proposta['whatsapp']) ?>','<?= addslashes($proposta['unique_id']) ?>','<?= addslashes($proposta['email']) ?>','<?= addslashes($proposta['id_contrato']) ?>')">
                            Abrir <i class="bi bi-arrow-right"></i>
                        </button>
                        <button class="button" onclick="showModalSettings('<?= addslashes($proposta['id_contrato']) ?>')">
                            Gerenciar <i class="bi bi-gear-fill"></i>
                        </button>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </section>

    <?php include '../layouts/Footer.php'; ?>

    <script>
        function showContractorInfo(primeiroNome, telefone, celular, whatsapp, unique_id, email, id_proposta) {
            Swal.fire({
                title: 'Informações do Prestador',
                html: `
                    <div style="text-align: left;">
                        <p><strong>Nome:</strong> ${primeiroNome}</p><br>
                        <p><strong>Telefone:</strong> ${telefone}</p><br>
                        <p><strong>Celular:</strong> ${celular}</p><br>
                        <p><strong>WhatsApp:</strong> ${whatsapp}</p><br>
                        <p><strong>Email:</strong> ${email}</p><br>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Fechar',
                cancelButtonText: 'Abrir Chat',
                width: '500px',
                padding: '1.5rem',
            }).then((result) => {
                if (result.isDismissed) {
                    window.open(`../../../../chat/chat.php?user_id=${unique_id}&proposta_id=${id_proposta}`, "_blank");
                }
            });
        }
    </script>

</body>
</html>
