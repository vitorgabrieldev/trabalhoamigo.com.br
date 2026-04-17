<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/config.php';

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
    $sql = "SELECT COUNT(*) AS count FROM usuarios WHERE (cpf = ? OR email = ? OR telefone = ?) AND ativo = 1";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param('sss', $cpf, $email, $telefone);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();
    
    return $count > 0;
}

// Função para inserir um novo usuário no banco de dados
function insertUser($conexao, $primeiroNome, $sobrenome, $celular, $whatsapp, $telefone, $email, $senhaHash, $cpf, $cep, $rua, $bairro, $numero, $complemento, $unique_id) {
    // Inserindo o usuário
    $sql = "INSERT INTO usuarios (primeiro_nome, ultimo_nome, celular, whatsapp, telefone, email, senha, tipo_usuario, cpf, unique_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexao->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Erro ao preparar a consulta: ' . $conexao->error);
    }
    
    $tipo_usuario = 'contratante';
    $stmt->bind_param('ssssssssss', $primeiroNome, $sobrenome, $celular, $whatsapp, $telefone, $email, $senhaHash, $tipo_usuario, $cpf, $unique_id);
    
    if (!$stmt->execute()) {
        throw new Exception('Erro ao inserir dados no banco de dados: ' . $stmt->error);
    }

    // Obtendo o ID do usuário recém-inserido
    $id_usuario = $stmt->insert_id;
    $stmt->close();

    // Inserindo o endereço
    $sqlEndereco = "INSERT INTO enderecos (id_usuario, cep, rua, bairro, numero, complemento) VALUES (?, ?, ?, ?, ?, ?)";
    $stmtEndereco = $conexao->prepare($sqlEndereco);
    
    if (!$stmtEndereco) {
        throw new Exception('Erro ao preparar a consulta de endereço: ' . $conexao->error);
    }
    
    $stmtEndereco->bind_param('isssis', $id_usuario, $cep, $rua, $bairro, $numero, $complemento);
    
    if (!$stmtEndereco->execute()) {
        throw new Exception('Erro ao inserir dados de endereço no banco de dados: ' . $stmtEndereco->error);
    }
    
    $stmtEndereco->close();
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
            $unique_id = rand(time(), 100000000);

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

            insertUser($conexao, $primeiroNome, $sobrenome, $celular, $whatsapp, $telefone, $email, $senhaHash, $cpf, $cep, $rua, $bairro, $numero, $complemento, $unique_id);

            // Resgata usuário criado
            $query = "SELECT * FROM usuarios WHERE email = ?";
            $stmt = $conexao->prepare($query);
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    // Inicializa a sessão
                    sessionAction($row);
                }
            } else {
                echo "Nenhum usuário encontrado com esse email.";
            }

            $stmt->close();

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

function sessionAction($dados) {
    if (!isset($_SESSION)) {
        session_start();
    };

    $_SESSION['logado'] = true;
    $_SESSION['id_usuario'] = $dados['id_usuario'];
    $_SESSION['primeiro_nome'] = $dados['primeiro_nome'];
    $_SESSION['ultimo_nome'] = $dados['ultimo_nome'];
    $_SESSION['celular'] = $dados['celular'];
    $_SESSION['whatsapp'] = $dados['whatsapp'];
    $_SESSION['telefone'] = $dados['telefone'];
    $_SESSION['email'] = $dados['email'];
    $_SESSION['cpf'] = $dados['cpf'];
    $_SESSION['data_Criacao'] = $dados['data_Criacao'];
    $_SESSION['tipo_usuario'] = $dados['tipo_usuario'];
    $_SESSION['ativo'] = $dados['ativo'];
    $_SESSION['unique_id'] = $dados['unique_id'];
    $_SESSION['img'] = $dados['img'];
};

processRegistration();
