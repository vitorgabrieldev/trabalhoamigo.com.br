<?php

header('Content-Type: application/json');

// Defina as constantes para a conexão com o banco de dados
define('DB_SERVER', '185.173.111.184');
define('DB_USERNAME', 'u858577505_trabalhoamigo');
define('DB_PASSWORD', '@#Trabalhoamigo023@_');
define('DB_NAME', 'u858577505_trabalhoamigo');

// Função para criar uma conexão com o banco de dados
function getDatabaseConnection() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

// Função para verificar se o CPF, e-mail ou telefone já estão registrados
function isDuplicate($conexao, $cpf, $email, $telefone) {
    $sql = "SELECT COUNT(*) AS count FROM usuarios WHERE cpf = ? OR email = ? OR telefone = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('sss', $cpf, $email, $telefone);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    
    return $count > 0;
}

// Função para inserir um novo usuário no banco de dados
function insertUser($conexao, $primeiroNome, $sobrenome, $celular, $whatsapp, $telefone, $email, $senhaHash, $cpf) {
    $sql = "INSERT INTO usuarios (primeiro_nome, ultimo_nome, celular, whatsapp, telefone, email, senha, tipo_usuario, cpf)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexao->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Erro ao preparar a consulta: ' . $conexao->error);
    }
    
    $tipo_usuario = 'contratante';
    $stmt->bind_param('sssssssss', $primeiroNome, $sobrenome, $celular, $whatsapp, $telefone, $email, $senhaHash, $tipo_usuario, $cpf);
    
    if (!$stmt->execute()) {
        throw new Exception('Erro ao inserir dados no banco de dados: ' . $stmt->error);
    }
    
    $stmt->close();
}

// Função principal para processar o cadastro
function processRegistration() {
    try {
        $conexao = getDatabaseConnection();
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $primeiroNome = $_POST['primeiroNome'] ?? null;
            $sobrenome = $_POST['sobrenome'] ?? null;
            $email = $_POST['email'] ?? null;
            $telefone = $_POST['telefone'] ?? null;
            $celular = $_POST['celular'] ?? null;
            $whatsapp = $_POST['whatsapp'] ?? null;
            $cpf = $_POST['cpf'] ?? null;
            $senha = $_POST['senha'] ?? null;
            $repetirSenha = $_POST['repetirSenha'] ?? null;
            $cep = $_POST['cep'] ?? null;
            $rua = $_POST['rua'] ?? null;
            $bairro = $_POST['bairro'] ?? null;
            $numero = $_POST['numero'] ?? null;
            $complemento = $_POST['complemento'] ?? null;
            $aceitouTermos = $_POST['aceitouTermos'] ?? null;

            if ($senha !== $repetirSenha) {
                echo json_encode([
                    'success' => false,
                    'message' => 'As senhas não coincidem'
                ]);
                exit;
            }

            // Criptografa a senha
            $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

            if (isDuplicate($conexao, $cpf, $email, $telefone)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'CPF, e-mail ou telefone já estão registrados'
                ]);
                exit;
            }

            insertUser($conexao, $primeiroNome, $sobrenome, $celular, $whatsapp, $telefone, $email, $senhaHash, $cpf);

            echo json_encode([
                'success' => true,
                'message' => 'Cadastro realizado com sucesso'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Método de requisição inválido'
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

// Chama a função principal
processRegistration();
