<?php
require '../library/db_connect.php';

// Captura os dados do formulário enviados via POST
$primeiro_nome = $_POST['primeiro_nome'];
$ultimo_nome = $_POST['ultimo_nome'];
$telefone = $_POST['telefone'];
$celular = $_POST['celular'];
$email = $_POST['email'];
$senha = password_hash($_POST['senha'], PASSWORD_DEFAULT); // Hash da senha para segurança

// Captura dos novos campos
$whatsapp = $_POST['whatsapp'];
$cpf = $_POST['cpf'];
$cep = $_POST['cep'];
$rua = $_POST['rua'];
$numero = $_POST['numero'];
$complemento = $_POST['complemento'];
$bairro = $_POST['bairro'];

$data_Criacao = date('Y-m-d H:i:s');
$tipo_usuario = 'usuario';
$ativo = 1; 

// SQL de inserção
$sql = "INSERT INTO default_usuarios (primeiro_nome, ultimo_nome, telefone, celular, email, senha, whatsapp, cpf, cep, rua, numero, complemento, data_Criacao, tipo_usuario, ativo, bairro) 
        VALUES (:primeiro_nome, :ultimo_nome, :telefone, :celular, :email, :senha, :whatsapp, :cpf, :cep, :rua, :numero, :complemento, :data_Criacao, :tipo_usuario, :ativo, :bairro)";

$stmt = $pdo->prepare($sql);
$stmt->bindParam(':primeiro_nome', $primeiro_nome);
$stmt->bindParam(':ultimo_nome', $ultimo_nome);
$stmt->bindParam(':telefone', $telefone);
$stmt->bindParam(':celular', $celular);
$stmt->bindParam(':email', $email);
$stmt->bindParam(':senha', $senha);
$stmt->bindParam(':whatsapp', $whatsapp);
$stmt->bindParam(':cpf', $cpf);
$stmt->bindParam(':cep', $cep);
$stmt->bindParam(':rua', $rua);
$stmt->bindParam(':numero', $numero);
$stmt->bindParam(':complemento', $complemento);
$stmt->bindParam(':data_Criacao', $data_Criacao);
$stmt->bindParam(':tipo_usuario', $tipo_usuario);
$stmt->bindParam(':ativo', $ativo);
$stmt->bindParam(':bairro', $bairro);

if ($stmt->execute()) {
    // Redireciona ou retorna uma mensagem de sucesso
    echo json_encode(['status' => 'success', 'message' => 'Usuário cadastrado com sucesso!']);
} else {
    // Retorna uma mensagem de erro
    echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar usuário.']);
}
