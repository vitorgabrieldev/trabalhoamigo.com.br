<?php

if (!isset($_SESSION)) {
    session_start();
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../../vendor/autoload.php';

class RecuperarSenhaController {
    public function enviarCodigoRecuperacao($email) {
        $codigoRecuperacao = rand(100000, 999999);
        $_SESSION['codigo_recuperacao'] = $codigoRecuperacao;
        $_SESSION['email_recuperacao'] = $email;

        if ($this->enviarEmail($email, $codigoRecuperacao)) {
            return [
                'success' => true,
                'message' => 'Código enviado para o seu e-mail.'
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
            $mail->SMTPDebug = 2; // Habilita a depuração (1 para erros e 2 para detalhes)
            $mail->SMTPAuth = true;
            $mail->SMTPSecure = 'tls';
            $mail->Host = 'smtp.gmail.com';
            $mail->Port = 587;
            $mail->Username = 'vitorgabrieldeoliveira.desktop@gmail.com';
            $mail->Password = 'qzsm gfmr fhzc okhi';
    
            $mail->setFrom('vitorgabrieldeoliveira.desktop@gmail.com', 'Trabalho Amigo');
            $mail->addAddress($destinatario);
    
            $mail->isHTML(true);
            $mail->Subject = 'Recuperação de Senha';
    
            // Carregar o conteúdo do arquivo HTML
            $html = file_get_contents('../templates/recuperacao_senha.html'); // Atualize o caminho conforme necessário
            $html = str_replace('{{codigo}}', $codigo, $html); // Substituir o espaço reservado pelo código
    
            $mail->Body = $html; // Definindo o corpo do e-mail como o conteúdo HTML carregado
            $mail->AltBody = 'Seu código de recuperação é: ' . $codigo; // Versão alternativa para clientes de e-mail que não suportam HTML
    
            $mail->send();
            return true;
        } catch (Exception $e) {
            // Aqui você pode registrar o erro
            error_log('Erro ao enviar e-mail: ' . $mail->ErrorInfo); // Registra o erro no log de erros
            return false;
        }
    }
    
}

$recuperarSenhaController = new RecuperarSenhaController();
$resultado = $recuperarSenhaController->enviarCodigoRecuperacao($_POST['email']);

echo json_encode($resultado);
