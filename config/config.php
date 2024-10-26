<?php

// Configurações do banco de dados
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

// Configurações do SMTP
if (!defined('SMTP_HOST')) {
    define('SMTP_HOST', 'smtp.gmail.com');
}
if (!defined('SMTP_PORT')) {
    define('SMTP_PORT', 587);
}
if (!defined('SMTP_USERNAME')) {
    define('SMTP_USERNAME', 'vitorgabrieldeoliveira.desktop@gmail.com');
}
if (!defined('SMTP_PASSWORD')) {
    define('SMTP_PASSWORD', 'qzsm gfmr fhzc okhi');
}
if (!defined('SMTP_FROM')) {
    define('SMTP_FROM', 'vitorgabrieldeoliveira.desktop@gmail.com');
}
if (!defined('SMTP_FROM_NAME')) {
    define('SMTP_FROM_NAME', 'Trabalho Amigo');
}

// Função de conexão
function getDatabaseConn() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

/**
 * Função para criar uma nova notificação.
 *
 * @param int $usuario_id ID do usuário que receberá a notificação.
 * @param string $mensagem Mensagem da notificação.
 * @param string $tipo Tipo da notificação (ex.: alerta, mensagem, etc.).
 * @param bool $status_lido Status de leitura da notificação (padrão: false).
 * @return bool Retorna true se a notificação foi criada com sucesso, false caso contrário.
 * @param string $redirecionar Redirecionamento do link.
 */
function criarNotificacao($usuario_id, $mensagem, $tipo, $redirecionar, $status_lido = false,) {
    $conn = getDatabaseConn();

    if ($conn->connect_error) {
        die("Erro de conexão: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("INSERT INTO notificacoes (usuario_id, mensagem, tipo, status_lido, redirecionar) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("issis", $usuario_id, $mensagem, $tipo, $status_lido, $redirecionar);

    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        return true;
    } else {
        $stmt->close();
        $conn->close();
        return false;
    }
}

/**
 * Função para trocar o status das notificações de um usuário.
 *
 * @param int $usuario_id ID do usuário cujas notificações serão atualizadas.
 * @param string $mensagem Mensagem da notificação que será atualizada.
 * @param string $novoStatus Novo status da notificação (ex.: lido, não lido).
 * @return bool Retorna true se o status das notificações foi atualizado com sucesso, false caso contrário.
 */
function trocarStatusNotificacoes($usuario_id, $mensagem, $novoStatus) {
    $conn = getDatabaseConn();

    if ($conn->connect_error) {
        die("Erro de conexão: " . $conn->connect_error);
    }

    $stmt = $conn->prepare("UPDATE notificacoes SET status_lido = ? WHERE usuario_id = ? AND mensagem = ?");
    $stmt->bind_param("sis", $novoStatus, $usuario_id, $mensagem);

    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        return true;
    } else {
        $stmt->close();
        $conn->close();
        return false;
    }
}