<?php

require '../../../../../library/AuthTOTP/vendor/autoload.php';

use AuthTOTP\GoogleAuthenticator;

session_start();

// Verifique se a requisição é um POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verifica se o código foi enviado e se o usuário está logado
    if (isset($_POST['code']) && isset($_SESSION['id_usuario'])) {
        $userId = $_SESSION['id_usuario'];

        // Certifique-se de que o secret já foi armazenado na sessão
        $secret = $_SESSION['TOTP_secret'];;

        // O código enviado pelo usuário
        $code = $_POST['code'];

        // Instancia o GoogleAuthenticator
        $googleAuthenticator = new GoogleAuthenticator();

        // Verifica se o código é válido
        if ($googleAuthenticator->checkCode($secret, $code)) {

            // Salva o TOTP no banco
            header('Content-Type: application/json');

            // Configuração da conexão com o banco de dados
            define('DB_SERVER', '185.173.111.184');
            define('DB_USERNAME', 'u858577505_trabalhoamigo');
            define('DB_PASSWORD', '@#Trabalhoamigo023@_');
            define('DB_NAME', 'u858577505_trabalhoamigo');

            // Conexão com o banco de dados
            $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

            // Verifica se houve erro na conexão
            if ($conn->connect_error) {
                echo json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados.']);
                exit;
            }

            // Prepara a atualização do segredo TOTP no banco
            $id_usuario = $_SESSION['id_usuario'];
            $sql = "UPDATE usuarios SET totp_secret = ? WHERE id_usuario = ?";
            $stmt = $conn->prepare($sql);

            if ($stmt) {
                $stmt->bind_param("si", $secret, $id_usuario);

                // Executa a atualização e verifica o resultado
                if ($stmt->execute()) {
                    $response = [
                        'success' => true,
                        'message' => 'Código verificado com sucesso! O segredo TOTP foi salvo.'
                    ];
                } else {
                    $response = [
                        'success' => false,
                        'message' => 'Ocorreu um erro ao atualizar o segredo TOTP.'
                    ];
                }

                $stmt->close(); // Fecha a declaração
            } else {
                $response = [
                    'success' => false,
                    'message' => 'Falha ao preparar a consulta.'
                ];
            }

            $conn->close(); // Fecha a conexão com o banco de dados
        } else {
            // O código está incorreto
            $response = [
                'success' => false,
                'message' => 'Código inválido. Tente novamente.'
            ];
        }
    } else {
        // Resposta se não for um POST válido ou se o código não foi enviado
        $response = [
            'success' => false,
            'message' => 'Código não enviado ou sessão inválida.'
        ];
    }

    // Retorna a resposta como JSON
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}
?>
