<?php
if (!isset($_SESSION)) {
    session_start();
};

header('Content-Type: application/json');

$email = $_POST['email'];
$codigo = $_POST['codigo'];

if (isset($_SESSION['email_recuperacao']) && isset($_SESSION['codigo_recuperacao'])) {
    if ($_SESSION['email_recuperacao'] === $email && $_SESSION['codigo_recuperacao'] == $codigo) {
        echo json_encode(['success' => true]);
        exit;
    } else {
        echo json_encode(['success' => false, 'message' => 'Código ou e-mail inválido.']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Nenhum código de recuperação encontrado.']);
    exit;
}
