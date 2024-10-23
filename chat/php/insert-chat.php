<?php 
session_start();
if(isset($_SESSION['unique_id'])){
    include_once "config.php";

    $outgoing_id = $_SESSION['unique_id'];
    $incoming_id = mysqli_real_escape_string($conn, $_POST['incoming_id']);
    
    // Verificação se 'message' está definido
    if (isset($_POST['message'])) {
        $message = mysqli_real_escape_string($conn, $_POST['message']);
    } else {
        // Retorne um erro se 'message' não estiver definido
        echo json_encode(['error' => 'Mensagem não recebida']);
        exit;
    }
    
    // Capture o servico_id da requisição
    if (isset($_POST['proposta_id'])) {
        $servico_id = mysqli_real_escape_string($conn, $_POST['proposta_id']);
    } else {
        // Retorne um erro se 'proposta_id' não estiver definido
        echo json_encode(['error' => 'Proposta ID não recebida']);
        exit;
    }

    if(!empty($message)){
        // Insira o servico_id na consulta
        $sql = mysqli_query($conn, "INSERT INTO messages (incoming_msg_id, outgoing_msg_id, msg, servico_id)
                                    VALUES ({$incoming_id}, {$outgoing_id}, '{$message}', '{$servico_id}')") or die(mysqli_error($conn));

        // Você pode querer retornar a mensagem como resposta (opcional)
        echo json_encode(['success' => true, 'message' => $message]); // Retorna a mensagem se necessário
    } else {
        echo json_encode(['error' => 'Mensagem está vazia']);
    }
} else {
    header("location: ../login.php");
}
