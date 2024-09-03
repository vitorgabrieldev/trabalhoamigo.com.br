<?php

header('Content-Type: application/json');

define('DB_SERVER', '185.173.111.184');
define('DB_USERNAME', 'u858577505_trabalhoamigo');
define('DB_PASSWORD', '@#Trabalhoamigo023@_');
define('DB_NAME', 'u858577505_trabalhoamigo');

function getDatabaseConnection() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

function verificarUsuario($conexao, $email, $senha) {
    $sql = "SELECT id, senha FROM usuarios WHERE email = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($id, $senhaHash);
    $stmt->fetch();
    $stmt->close();
    
    if ($id && password_verify($senha, $senhaHash)) {
        return $id;
    } else {
        return false;
    }
}

function processLogin() {
    try {
        $conexao = getDatabaseConnection();
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? null;
            $senha = $_POST['senha'] ?? null;

            if (empty($email) || empty($senha)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Por favor, preencha todos os campos.'
                ]);
                exit;
            }

            $usuarioId = verificarUsuario($conexao, $email, $senha);

            if ($usuarioId) {
                session_start();
                $_SESSION['user_id'] = $usuarioId;

                echo json_encode([
                    'success' => true,
                    'message' => 'Login bem-sucedido.'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Email ou senha inválidos.'
                ]);
            }
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Método de requisição inválido.'
            ]);
        }

        $conexao->close();
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

processLogin();
