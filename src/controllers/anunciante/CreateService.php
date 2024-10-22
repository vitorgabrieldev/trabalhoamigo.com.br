<?php
session_start();

// Conexão com o banco de dados
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

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verifica a conexão
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Conexão falhou: ' . $conn->connect_error]);
    exit;
}

// Processar o cadastro do serviço via AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = $_POST['titulo'] ?? '';
    $descricao = $_POST['descricao'] ?? '';
    $preco = $_POST['preco'] ?? 0.00;
    $aceita_oferta = $_POST['aceita_oferta'] ?? 0;
    $comunitario = $_POST['comunitario'] ?? 0;
    $id_categoria_fk = $_POST['id_categoria_fk'] ?? 0;
    $id_usuario_fk = $_SESSION['id_usuario'];

    // Inicializar a variável da imagem
    $imagem = 'null';

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
                $newFileName = uniqid('servico_', true) . '.' . pathinfo($_FILES['arquivo']['name'], PATHINFO_EXTENSION);
                $uploadFileDir = '../../../public/uploads/servicos/';
                $destPath = $uploadFileDir . $newFileName;

                // Mover o arquivo para o diretório de upload
                if (move_uploaded_file($fileTmpPath, $destPath)) {
                    $imagem = $newFileName; 
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
    }

    // Inserir no banco de dados
    $stmt = $conn->prepare("INSERT INTO servicos (id_usuario_fk, id_categoria_fk, titulo, descricao, preco, aceita_oferta, comunitario, imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    if ($stmt === false) {
        echo json_encode(['status' => 'error', 'message' => 'Erro na preparação da declaração: ' . $conn->error]);
        exit;
    }

    $stmt->bind_param("iissdiss", $id_usuario_fk, $id_categoria_fk, $titulo, $descricao, $preco, $aceita_oferta, $comunitario, $imagem);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Serviço cadastrado com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar serviço: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
