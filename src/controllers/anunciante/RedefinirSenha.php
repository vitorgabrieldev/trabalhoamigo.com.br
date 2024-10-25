<?php
header('Content-Type: application/json');

$email = $_POST['email'];
$novaSenha = $_POST['novaSenha'];

if (!isset($_SESSION)) {
    session_start();
}

require_once __DIR__ . '/../../../config/config.php';

function getDatabaseConnection() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

function atualizarSenha($email, $novaSenha) {
    $conexao = getDatabaseConnection();

    $hashedPassword = password_hash($novaSenha, PASSWORD_DEFAULT);

    $sql = "UPDATE usuarios SET senha = ?, totp_enabled = 0, totp_secret = Null WHERE email = ?";
    $stmt = $conexao->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Erro na preparação da consulta: " . $conexao->error);
    }

    $stmt->bind_param('ss', $hashedPassword, $email);
    $stmt->execute();
    $stmt->close();

    return true;
}

try {
    atualizarSenha($email, $novaSenha);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erro ao redefinir a senha.']);
}
