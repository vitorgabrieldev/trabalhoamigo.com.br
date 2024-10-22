<?php

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

// Conexão com o banco de dados
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verifica a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

if (!isset($_SESSION)) {
    session_start();
}

// Verifica se um arquivo foi enviado
if (isset($_FILES['arquivo'])) {
    if ($_FILES['arquivo']['error'] == UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['arquivo']['tmp_name'];
        $fileName = $_FILES['arquivo']['name'];
        $fileSize = $_FILES['arquivo']['size'];
        $fileType = $_FILES['arquivo']['type'];

        // Definindo as extensões permitidas
        $allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

        // Verifica se o tipo de arquivo é permitido
        if (in_array($fileType, $allowedFileTypes)) {
            $newFileName = uniqid('usuario_', true) . '.' . pathinfo($fileName, PATHINFO_EXTENSION);
            $uploadFileDir = '../../../../../public/uploads/usuarios/';
            $destPath = $uploadFileDir . $newFileName;

            // Mover o arquivo para o diretório de upload
            if (move_uploaded_file($fileTmpPath, $destPath)) {
                
                $userId = $_SESSION['id_usuario'];

                // Prepara a consulta para atualizar a tabela
                $stmt = $conn->prepare("UPDATE usuarios SET img = ? WHERE id_usuario = ?");
                $stmt->bind_param("si", $newFileName, $userId);

                if ($stmt->execute()) {

                    $_SESSION['img'] = $newFileName;

                    echo json_encode(['status' => 'success', 'message' => 'Arquivo enviado com sucesso!', 'fileName' => $newFileName]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar a imagem no banco de dados.']);
                }

                $stmt->close();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Erro ao mover o arquivo para a pasta de uploads. Verifique as permissões do diretório.']);
                exit;
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Tipo de arquivo não permitido. Apenas imagens JPEG, PNG e GIF são aceitas.']);
            exit;
        }
    } else {
        // Mensagem de erro com base no código de erro do upload
        switch ($_FILES['arquivo']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                echo json_encode(['status' => 'error', 'message' => 'Arquivo muito grande. O tamanho máximo permitido é ' . ini_get('upload_max_filesize') . '.']);
                break;
            case UPLOAD_ERR_PARTIAL:
                echo json_encode(['status' => 'error', 'message' => 'O arquivo foi apenas parcialmente enviado.']);
                break;
            case UPLOAD_ERR_NO_FILE:
                echo json_encode(['status' => 'error', 'message' => 'Nenhum arquivo foi enviado.']);
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                echo json_encode(['status' => 'error', 'message' => 'Diretório temporário ausente. Verifique a configuração do PHP.']);
                break;
            case UPLOAD_ERR_CANT_WRITE:
                echo json_encode(['status' => 'error', 'message' => 'Erro ao gravar o arquivo no disco.']);
                break;
            case UPLOAD_ERR_EXTENSION:
                echo json_encode(['status' => 'error', 'message' => 'Uma extensão do PHP interrompeu o envio do arquivo.']);
                break;
            default:
                echo json_encode(['status' => 'error', 'message' => 'Erro desconhecido durante o upload do arquivo.']);
                break;
        }
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nenhum arquivo enviado.']);
}

$conn->close();
?>