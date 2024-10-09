<?php

// Iniciar a sessão
session_start();

// Definir as constantes de conexão ao banco de dados
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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_SESSION['id_usuario'])) {
        echo "Usuário não está autenticado.";
        exit;
    }

    $valor = (float) $_POST['valor'];
    $descricao = $_POST['descricao'];
    $tempo = (int) $_POST['tempo'];
    $id_servico_fk = (int) $_POST['id_servico'];
    $id_usuario_contrante_fk = (int) $_SESSION['id_usuario'];
    $data_contrato = date('Y-m-d H:i:s');
    $prazo_estimado = date('Y-m-d H:i:s', strtotime("+$tempo days"));

    try {
        // Criar a conexão
        $conexao = getDatabaseConnection();

        // Preparar a instrução SQL para buscar o ID do anunciante
        $stmt = $conexao->prepare("SELECT id_usuario_fk FROM servicos WHERE id_usuario_fk = ?");
        if (!$stmt) {
            throw new Exception('Erro ao preparar a declaração: ' . $conexao->error);
        }

        $stmt->bind_param("i", $id_servico_fk);

        if (!$stmt->execute()) {
            throw new Exception('Erro ao buscar o ID do anunciante: ' . $stmt->error);
        }

        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $id_usuario_prestador_fk = (int) $row['id_usuario_fk'];
        } else {
            echo "Nenhum anunciante encontrado para o serviço.";
            exit;
        }

        $stmt->close(); // Fecha a declaração

        // Preparar a instrução SQL para inserir a proposta
        $stmt = $conexao->prepare("INSERT INTO proposta (id_servico_fk, id_usuario_contrante_fk, id_usuario_prestador_fk, data_contrato, prazo_estimado, valor_total, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)");

        // Verifica se a preparação da declaração falhou
        if (!$stmt) {
            throw new Exception('Erro ao preparar a declaração: ' . $conexao->error);
        }

        // Vincula os parâmetros
        $stmt->bind_param("iiissds", $id_servico_fk, $id_usuario_contrante_fk, $id_usuario_prestador_fk, $data_contrato, $prazo_estimado, $valor, $descricao);

        // Executa a declaração
        if ($stmt->execute()) {
            echo "Proposta enviada com sucesso!";
        } else {
            echo "Erro ao enviar proposta: " . $stmt->error;
        }

        // Fecha a declaração
        $stmt->close();
        // Fecha a conexão
        $conexao->close();

    } catch (Exception $e) {
        echo "Erro: " . $e->getMessage();
    }
} else {
    echo "Método de requisição não suportado.";
}
