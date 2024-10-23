<?php
session_start();
if (isset($_SESSION['unique_id'])) {
    include_once "config.php";
    
    $outgoing_id = $_SESSION['unique_id'];
    $incoming_id = mysqli_real_escape_string($conn, $_POST['incoming_id']);
    $last_message_id = isset($_POST['last_message_id']) ? $_POST['last_message_id'] : 0;
    $servico_id = isset($_POST['proposta_id']) ? mysqli_real_escape_string($conn, $_POST['proposta_id']) : null; // Captura o servico_id

    $output = "";

    // Verifica se o servico_id foi passado
    if ($servico_id) {
        // Busca apenas mensagens novas para o serviço atual
        $sql = "SELECT * FROM messages 
                LEFT JOIN usuarios ON usuarios.unique_id = messages.outgoing_msg_id
                WHERE ((outgoing_msg_id = {$outgoing_id} AND incoming_msg_id = {$incoming_id})
                OR (outgoing_msg_id = {$incoming_id} AND incoming_msg_id = {$outgoing_id}))
                AND msg_id > {$last_message_id} 
                AND servico_id = {$servico_id}  -- Filtra por servico_id
                ORDER BY msg_id ASC";

        $query = mysqli_query($conn, $sql);

        if (mysqli_num_rows($query) > 0) {
            while ($row = mysqli_fetch_assoc($query)) {
                if ($row['outgoing_msg_id'] === $outgoing_id) {
                    $output .= '<div class="chat outgoing">
                                <div class="details">
                                    <p>' . $row['msg'] . '</p>
                                </div>
                                </div>';
                } else {
                    $output .= '<div class="chat incoming">
                                <div class="details">
                                    <p>' . $row['msg'] . '</p>
                                </div>
                                </div>';
                }
            }
        } else {
            $output .= '<div class="text">Sem novas mensagens</div>';
        }
    } else {
        $output .= '<div class="text">Serviço não encontrado.</div>'; // Mensagem de erro se não houver servico_id
    }

    echo $output;
} else {
    header("location: ../login.php");
}
