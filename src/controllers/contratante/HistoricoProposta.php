<?php
session_start();

// Conexão com o banco de dados
if (!defined('DB_SERVER')) {
    define('DB_SERVER', '185.173.111.184');
}
if (!defined('DB_USERNAME')) {
    define('DB_USERNAME', 'u858577505_trabalhoamigo');
}
if (!defined('DB_PASSWORD')) {
    define('DB_PASSWORD', '@#Trabalhoamigo023@_');
}
if (!defined('DB_NAME')) {
    define('DB_NAME', 'u858577505_trabalhoamigo');
}

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verificação da conexão
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Erro de conexão: ' . $conn->connect_error]));
}

// Verifica se o usuário está logado
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
    exit;
}

function obterIdServicoPorContrato($idContrato, $conn) {
    $sql = "SELECT id_servico_fk FROM proposta WHERE id_contrato = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $idContrato);
    $stmt->execute();
    $stmt->bind_result($idServico);
    $stmt->fetch();
    $stmt->close();

    return $idServico;
}

// Verifica se os dados foram recebidos corretamente
if (isset($_POST['acao']) && isset($_POST['id'])) {
    $idContrato = (int) $_POST['id'];
    $acao = $_POST['acao'];
    $usuario_id = $_SESSION['id_usuario']; // ID do usuário autenticado

    if ($acao === 'finalizar') {
        // Atualizar o status da proposta para finalizado (considerando status 2 como finalizado)
        $sql = "UPDATE proposta SET status = 3 WHERE id_contrato = ? AND id_usuario_contrante_fk = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $idContrato, $usuario_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Contrato finalizado com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao finalizar o contrato.']);
        }

        $stmt->close();

    } elseif ($acao === 'excluir') {
        // Excluir o contrato da tabela
        $sql = "DELETE FROM proposta WHERE id_contrato = ? AND id_usuario_contrante_fk = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $idContrato, $usuario_id);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Contrato excluído com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir o contrato.']);
        }

        $stmt->close();

    } elseif ($acao === 'avaliar') {
        
        $avaliacao = (int) $_POST['avaliacao'];
        $comentario = isset($_POST['comentario']) ? $_POST['comentario'] : null;
        $idServico = obterIdServicoPorContrato($idContrato, $conn); 

        // Validar a quantidade de estrelas (1 a 5)
        if ($avaliacao < 1 || $avaliacao > 5) {
            echo json_encode(['success' => false, 'message' => 'Avaliação inválida.']);
            exit;
        }

        // Inserir a avaliação na tabela `avaliacao_servico`
        $sql = "INSERT INTO avaliacao_servico (id_usuario_fk, id_servico_fk, estrelas, comentario, data_publicacao)
                VALUES (?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iiis', $usuario_id, $idServico, $avaliacao, $comentario);

        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Avaliação enviada com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao enviar a avaliação.']);
        }

        $stmt->close();

    } else {
        echo json_encode(['success' => false, 'message' => 'Ação inválida.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Dados incompletos.']);
}

$conn->close();