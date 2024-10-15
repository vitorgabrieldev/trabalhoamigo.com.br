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
    $sql = "SELECT id_usuario, senha FROM usuarios WHERE email = ? and tipo_usuario = 'contratante'";
    $stmt = $conexao->prepare($sql);

    if (!$stmt) {
        // Exibe a mensagem de erro da consulta SQL
        throw new Exception("Erro na preparação da consulta: " . $conexao->error);
    }

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

function retornUsuarioLogado($conexao, $email) {
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conexao->prepare($sql);

    if (!$stmt) {
        throw new Exception("Erro na preparação da consulta: " . $conexao->error);
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    
    $resultado = $stmt->get_result();
    
    if ($usuario = $resultado->fetch_assoc()) {
        $stmt->close();
        return $usuario;  
    } else {
        $stmt->close();
        return null;  
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
                
                $dados = retornUsuarioLogado($conexao, $email);

                $_SESSION['logado'] = true;
                $_SESSION['primeiro_nome'] = $dados['primeiro_nome'];
                $_SESSION['ultimo_nome'] = $dados['ultimo_nome'];
                $_SESSION['celular'] = $dados['celular'];
                $_SESSION['whatsapp'] = $dados['whatsapp'];
                $_SESSION['telefone'] = $dados['telefone'];
                $_SESSION['email'] = $dados['email'];
                $_SESSION['cpf'] = $dados['cpf'];
                $_SESSION['cnpj'] = $dados['cnpj'];
                $_SESSION['data_Criacao'] = $dados['data_Criacao'];
                $_SESSION['tipo_usuario'] = $dados['tipo_usuario'];
                $_SESSION['ativo'] = $dados['ativo'];
                $_SESSION['id_usuario'] = $usuarioId;
                $_SESSION['unique_id'] = $dados['unique_id'];

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
