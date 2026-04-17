<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/config.php';

function getDatabaseConnection() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

function verificarUsuario($conexao, $email, $senha) {
    $sql = "SELECT id_usuario, senha, totp_enabled FROM usuarios WHERE email = ? AND tipo_usuario = 'contratante' AND ativo = 1";
    $stmt = $conexao->prepare($sql);

    if (!$stmt) {
        throw new Exception("Erro na preparação da consulta: " . $conexao->error);
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($id, $senhaHash, $totp_enabled);
    $stmt->fetch();
    $stmt->close();
    
    if ($id && password_verify($senha, $senhaHash)) {
        return ['id' => $id, 'totp_enabled' => $totp_enabled];
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

require '../../../vendor/autoload.php';

use OTPHP\TOTP;

function verificarTOTP($id, $code) {
    $conexao = getDatabaseConnection();

    $sql = "SELECT totp_secret FROM usuarios WHERE id_usuario = ?";
    $stmt = $conexao->prepare($sql);

    if (!$stmt) { 
        throw new Exception("Erro na preparação da consulta: " . $conexao->error);
    }

    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->bind_result($totp_secret);
    $stmt->fetch();
    $stmt->close();

    $totp = TOTP::create($totp_secret);

    return $totp->verify($code);
}

function processLogin() {
    try {
        $conexao = getDatabaseConnection();
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $email = $_POST['email'] ?? null;
            $senha = $_POST['senha'] ?? null;
            $totpCode = $_POST['totp'] ?? null; // TOTP code from request

            if (empty($email) || empty($senha)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Por favor, preencha todos os campos.'
                ]);
                exit;
            }

            $usuario = verificarUsuario($conexao, $email, $senha);

            if ($usuario) {
                if ($usuario['totp_enabled']) { // Check if TOTP is enabled
                    if (empty($totpCode)) {
                        echo json_encode([
                            'success' => false,
                            'require_totp' => true,
                            'message' => 'Autenticação de dois fatores necessária.'
                        ]);
                        exit;
                    }

                    if (!verificarTOTP($usuario['id'], $totpCode)) {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Código de autenticação de dois fatores inválido.'
                        ]);
                        exit;
                    }
                }

                date_default_timezone_set('America/Sao_Paulo');

                // Atualiza o último login do usuário
                $sqlUpdate = "UPDATE usuarios SET last_login_at = ? WHERE id_usuario = ?";
                $stmtUpdate = $conexao->prepare($sqlUpdate);

                if (!$stmtUpdate) {
                    throw new Exception("Erro na preparação da atualização: " . $conexao->error);
                }

                $lastLogin = date('Y-m-d H:i:s');
                $stmtUpdate->bind_param('si', $lastLogin,$usuario['id']);
                $stmtUpdate->execute();
                $stmtUpdate->close();

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
                $_SESSION['data_Criacao'] = $dados['data_Criacao'];
                $_SESSION['tipo_usuario'] = $dados['tipo_usuario'];
                $_SESSION['ativo'] = $dados['ativo'];
                $_SESSION['id_usuario'] = $usuario['id'];
                $_SESSION['unique_id'] = $dados['unique_id'];
                $_SESSION['img'] = $dados['img'];

                // RandomNotify($usuario['id']);

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

/**
 * Função para enviar notificações de segurança aleatórias.
 *
 * @param int $usuario_id ID do usuário que receberá a notificação.
 */
function RandomNotify($usuario_id) {
    // Array de mensagens com tipos associados
    $notificacoes = [
        'segurança' => [
            "Considere ativar a autenticação em duas etapas.",
            "Lembre-se de verificar sua atividade de login regularmente.",
            "Ative as notificações de login para maior segurança.",
            "Utilize senhas fortes e únicas para suas contas.",
            "Cuidado com phishing! Nunca clique em links suspeitos.",
        ],
        'promoções' => [
            "Aproveite 20% de desconto na sua próxima compra!",
            "Novos serviços estão disponíveis! Confira já!",
            "Indique um amigo e ganhe créditos!",
            "Promoção válida por tempo limitado! Não perca!",
        ],
        'alertas' => [
            "Houve uma alteração na sua conta, verifique as configurações.",
            "Uma nova mensagem chegou para você!",
            "Seu perfil precisa de atualização. Complete agora!",
        ],
        'dicas' => [
            "Dica do dia: Mantenha suas senhas em locais seguros.",
            "Lembre-se de sair da sua conta ao usar dispositivos públicos.",
            "Explore nossos recursos para aproveitar melhor nossos serviços.",
        ],
    ];

    // Escolher aleatoriamente um tipo de notificação
    $tipos = array_keys($notificacoes);
    $tipoAleatorio = $tipos[array_rand($tipos)];

    // Escolher uma mensagem aleatória do tipo escolhido
    $mensagemAleatoria = $notificacoes[$tipoAleatorio][array_rand($notificacoes[$tipoAleatorio])];

    if (rand(1, 100) <= 100) { 
        $redirecionar = 'https://trabalhoamigo.vitorgabrieldev.io/';

        // Chama a função para criar a notificação
        criarNotificacao($usuario_id, $mensagemAleatoria, $tipoAleatorio, $redirecionar);
    }
}