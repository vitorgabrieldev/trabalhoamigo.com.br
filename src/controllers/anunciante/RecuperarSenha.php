<?php

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

function verificarUsuario($email) {
    
    $conexao = getDatabaseConnection();
    
    $sql = "SELECT id_usuario FROM usuarios WHERE email = ? AND tipo_usuario = 'anunciante' AND ativo = 1";
    $stmt = $conexao->prepare($sql);

    if (!$stmt) {
        throw new Exception("Erro na preparação da consulta: " . $conexao->error);
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->bind_result($id);
    $stmt->fetch();
    $stmt->close();
    
    if ($id) {
        return true;
    } else {
        return false;
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../../vendor/autoload.php';

class RecuperarSenhaController {
    public function enviarCodigoRecuperacao($email) {

        if (!verificarUsuario($email)) {
            return [
                'success' => false,
                'message' => 'Este e-mail não pertence a um usuário.'
            ];
            exit;
        };

        $codigoRecuperacao = rand(100000, 999999);
        $_SESSION['codigo_recuperacao'] = $codigoRecuperacao;
        $_SESSION['email_recuperacao'] = $email;

        if ($this->enviarEmail($email, $codigoRecuperacao)) {
            return [
                'success' => true
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Erro ao enviar e-mail.'
            ];
        }
    }

    private function enviarEmail($destinatario, $codigo) {
        $mail = new PHPMailer(true);
        try {
            // Configuração do SMTP
            $mail->isSMTP();
            $mail->SMTPAuth = true;
            $mail->SMTPSecure = 'tls';
            $mail->Host = 'smtp.gmail.com';
            $mail->Port = 587;
            $mail->Username = 'vitorgabrieldeoliveira.desktop@gmail.com';
            $mail->Password = 'qzsm gfmr fhzc okhi';
    
            $mail->setFrom('vitorgabrieldeoliveira.desktop@gmail.com', 'Trabalho Amigo');
            $mail->addAddress($destinatario);
    
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = 'Recuperação de Senha';
    
            // Carregar o conteúdo do arquivo HTML
            $html = file_get_contents('../templates/recuperacao_senha.html');
            $html = str_replace('{{codigo}}', $codigo, $html); 
    
            $mail->Body = $html;
            $mail->AltBody = 'Seu código de recuperação é: ' . $codigo;
    
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Erro ao enviar e-mail: ' . $mail->ErrorInfo);
            return false;
        }
    }
    
}

$recuperarSenhaController = new RecuperarSenhaController();
$resultado = $recuperarSenhaController->enviarCodigoRecuperacao($_POST['email']);

echo json_encode($resultado);
