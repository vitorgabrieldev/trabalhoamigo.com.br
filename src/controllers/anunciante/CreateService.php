<?php
session_start();

// Conexão com o banco de dados
define('DB_SERVER', '185.173.111.184');
define('DB_USERNAME', 'u858577505_trabalhoamigo');
define('DB_PASSWORD', '@#Trabalhoamigo023@_');
define('DB_NAME', 'u858577505_trabalhoamigo');

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Verifica a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
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

    // Inserir no banco de dados
    $stmt = $conn->prepare("INSERT INTO servicos (id_usuario_fk, id_categoria_fk, titulo, descricao, preco, aceita_oferta, comunitario) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iissdii", $id_usuario_fk, $id_categoria_fk, $titulo, $descricao, $preco, $aceita_oferta, $comunitario);

    if ($stmt->execute()) {
        echo "Serviço cadastrado com sucesso!";
    } else {
        echo "Erro ao cadastrar serviço: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
