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

        // Consulta para obter o id_usuario_contrante_fk da proposta
        $sql = "SELECT * FROM usuarios WHERE unique_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $incoming_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $idContratante = $row['id_usuario'];
            
            // Criar notificação
            criarNotificacao($idContratante, 'Você recebeu uma nova mensagem', 'Informações', 'https://trabalhoamigo.vitorgabrieldev.io/chat/chat.php?user_id='.$incoming_id.'&proposta_id='.$servico_id);
        } else {
            echo json_encode(['error' => 'Erro ao gerar notificação']);
        }

        $sql = "SELECT * FROM usuarios WHERE unique_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $outgoing_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $id = $row['id_usuario'];
            
            trocarStatusNotificacoes($id, "Você recebeu uma nova mensagem", 1);
        } else {
            echo json_encode(['error' => 'Erro ao gerar notificação']);
        }

        echo json_encode(['success' => true, 'message' => $message]);
    } else {
        echo json_encode(['error' => 'Mensagem está vazia']);
    }
} else {
    header("location: ../login.php");
}
