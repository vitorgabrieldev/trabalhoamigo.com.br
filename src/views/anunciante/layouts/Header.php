
<?php

if (!isset($_SESSION)) {
    session_start();
}


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

// Verifica se o formulário foi enviado via POST para atualizar o endereço
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rua'], $_POST['numero'], $_POST['cidade'], $_POST['estado'], $_POST['cep'])) {
    header('Content-Type: application/json');
    // Verifica se houve erro na conexão
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados.']);
        exit;
    }

    // Verifica se o usuário está logado
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
        exit;
    }

    // Filtra e obtém os dados do formulário
    $id_usuario = $_SESSION['id_usuario'];
    $rua = $conn->real_escape_string($_POST['rua']);
    $numero = intval($_POST['numero']);
    $cidade = $conn->real_escape_string($_POST['cidade']);
    $estado = $conn->real_escape_string($_POST['estado']);
    $cep = $conn->real_escape_string($_POST['cep']);

    // Atualiza o endereço do usuário no banco de dados usando prepared statement
    $sql = "UPDATE enderecos SET rua = ?, numero = ?, cep = ?, bairro = ?, complemento = ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sisssi", $rua, $numero, $cep, $cidade, $estado, $id_usuario);

    // Executa a atualização e verifica o resultado
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Endereço atualizado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o endereço: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
}

?>

<section id="popup-profile">
    <header class="topo-popup-profile">
        <img width="40px" height="40px" class="logo" src="../../../../public/img/logo/favicon.ico" alt="Logo Rodapé">
        <h2 class="name-user"><?php echo isset($_SESSION['primeiro_nome']) ? $_SESSION['primeiro_nome'] : 'NotFound 404'; ?></h2>

    </header>
    <hr class="small-line">
    <div class="list-links">
        <a class="link DispathAlert" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
            </svg>
            Meu Perfil
        </a>
        <a class="link" onclick="openModalEndereco()" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-house-fill" viewBox="0 0 16 16">
                <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293z"/>
                <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293z"/>
            </svg>
            Alterar endereço
        </a>
        <a class="link DispathAlert" href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-question-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
            </svg>
            Ajuda
        </a>
    </div>
    <hr class="small-line">
    <a onclick="Logout()" class="link link-child-logout" href="#">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-door-open-fill" viewBox="0 0 16 16">
            <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"/>
        </svg>
        SAIR
    </a>
</section>

<header id="site-topo">
    <a href="../PaginaInicial/">
        <div class="logo-box">
            <img width="40px" height="40px" class="logo" src="../../../../public/img/logo/favicon.ico" alt="Logo Rodapé">
        </div>
    </a>
    <nav class="navigation-box">
        <div class="links-box">
            <a class="link-element" href="../CadastroServico/">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/></svg>
                Criar Serviço
            </a>
            <a class="link-element" href="../ListagemProposta/">
                <img src="../../../../public/img/Icon-document.png" alt="Icon Propostas">
                Propostas
            </a>
            <a class="link-element" href="#" onclick="toggleNotifications()">
                <img src="../../../../public/img/Icon-notification.png" alt="Icon Notificações">
                Notificações
            </a>
        </div>
        <div class="userProfile-circle">
            <img src="../../../../public/img/UserProfile-default.png" alt="Imagem de Usuário Padrão">
            <img src="../../../../public/img/Topo-User-More.png" alt="Btn Mais informações">
        </div>
        <div class="openMenuTopo menu-mobile">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
        </div>
    </nav>
</header>

<!-- ================================================================================== -->

<div id="notification-dropdown" class="notification-dropdown" style="display:none;">
    <ul>
        <li>
            <p>Você recebeu uma nova proposta!</p>
            <span class="notification-time">10:30 AM</span>
        </li>
        <li>
            <p>Os acessos ao seus serviços subiram em 49% durante esse mês.</p>
            <span class="notification-time">9:15 AM</span>
        </li>
        <li>
            <p>Confira as notas de atualizações.</p>
            <span class="notification-time">8:45 AM</span>
        </li>
    </ul>
</div>


<script>
function toggleNotifications() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}
</script>

<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/670d6ceb4304e3196ad17d2a/1ia672tsb';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->

<?php

// Verifica se o usuário está logado
if (!isset($_SESSION['id_usuario'])) {
    die("Usuário não autenticado.");
}

// Verifica se houve erro na conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Recupera o endereço atual do usuário
$id_usuario = $_SESSION['id_usuario'];
$sql = "SELECT rua, numero, cep, bairro, complemento FROM enderecos WHERE id_usuario = ?";
$stmt = $conn->prepare($sql);

// Verifique se a preparação da consulta foi bem-sucedida
if (!$stmt) {
    die("Erro na preparação da consulta: " . $conn->error);
}

$stmt->bind_param("i", $id_usuario);
$stmt->execute();
$result = $stmt->get_result();
$endereco = $result->fetch_assoc();

$stmt->close();
$conn->close();
?>

<!-- Modal de Alterar Endereço -->
<div id="modal-alterar-endereco" class="modal-alterar-endereco" style="display: none">
    <div class="modal-content-alterar-endereco">
        <span class="close-alterar-endereco" onclick="closeModalEndereco()">&times;</span>
        <form id="form-alterar-endereco" action="../layouts/controller/UpdateAdress.php" method="POST">
            <div class="form-group-alterar-endereco">
                <label for="cep">CEP:</label>
                <input type="text" id="cep" name="cep" class="input cep mascara-cep" value="<?php echo isset($endereco['cep']) ? $endereco['cep'] : ''; ?>" required>
            </div>
            <hr>
            <div class="form-group-alterar-endereco">
                <label for="numero">Número:</label>
                <input type="text" id="numero" name="numero" value="<?php echo isset($endereco['numero']) ? $endereco['numero'] : ''; ?>" required>
            </div>
            <div class="form-group-alterar-endereco">
                <label for="rua">Rua:</label>
                <input type="text" id="rua" name="rua" class="input rua" value="<?php echo isset($endereco['rua']) ? $endereco['rua'] : ''; ?>" required disabled>
            </div>
            <div class="form-group-alterar-endereco">
                <label for="bairro">Bairro:</label>
                <input type="text" id="bairro" name="bairro" class="input bairro" value="<?php echo isset($endereco['bairro']) ? $endereco['bairro'] : ''; ?>" required disabled>
            </div>
            <button type="submit" class="btn-alterar-endereco">Salvar</button>
        </form>
    </div>
</div>

<div class="background-loading-50 hidden">
    <div class="loading-icon"></div>
</div>

<script>
function openModalEndereco() {
    document.getElementById('modal-alterar-endereco').style.display = 'flex';
    $("#popup-profile").toggle();
}

function closeModalEndereco() {
    document.getElementById('modal-alterar-endereco').style.display = 'none';
}

$(document).ready(function() {
    // Evento para consulta do CEP
    $('.mascara-cep').on('input', function () {
        const cep = $(this).val().trim().replace(/\D/g, ''); // Remove caracteres não numéricos
        if (cep.length === 8) {
            $(".background-loading-50").removeClass('hidden');

            $.ajax({
                url: `https://viacep.com.br/ws/${cep}/json/`,
                method: 'GET',
                success: function (data) {
                    $(".background-loading-50").addClass('hidden');
                    if (data.erro) {
                        Swal.fire({
                            icon: 'error',
                            title: 'CEP Inválido',
                            text: 'Não foi possível encontrar o CEP informado.'
                        });
                    } else {
                        // Preenche os campos com os dados do CEP
                        $('.input.rua').val(data.logradouro).prop('disabled', false);
                        $('.input.bairro').val(data.bairro).prop('disabled', false);
                        $('.input.cidade').val(data.localidade).prop('disabled', false);
                        $('.input.uf').val(data.uf).prop('disabled', false);

                        // Remove as labels dos campos preenchidos
                        $('.input.rua').siblings('label').hide();
                        $('.input.bairro').siblings('label').hide();
                        $('.input.cidade').siblings('label').hide();
                        $('.input.uf').siblings('label').hide();
                    }
                },
                error: function () {
                    $(".background-loading-50").addClass('hidden');
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: 'Erro ao consultar o CEP. Tente novamente mais tarde.'
                    });
                }
            });
        } else if (cep.length > 8) {
            Swal.fire({
                icon: 'warning',
                title: 'CEP Inválido',
                text: 'O CEP deve ter exatamente 8 dígitos.'
            });
        }
    });

    // Interceptar a submissão do formulário
    $("#form-alterar-endereco").on("submit", function(event) {
        event.preventDefault();

        $(".background-loading-50").removeClass('hidden');

        $.ajax({
            url: $(this).attr('action'),
            type: 'POST',
            data: $(this).serialize(),
            success: function(data) {
                $(".background-loading-50").addClass('hidden');
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Sucesso!',
                        text: data.message 
                    });
                    closeModalEndereco();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erro',
                        text: data.message
                    });
                }
            },
            error: function(xhr, status, error) {
                $(".background-loading-50").addClass('hidden');
                console.error('Erro na requisição:', xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Ocorreu um erro, tente novamente mais tarde.'
                });
            }
        });
    });
});
</script>


</script>

<style>
.modal-alterar-endereco {
    position: fixed; 
    z-index: 1; 
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.4); 
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-alterar-endereco * {
    font-family: sans-serif;
}

.modal-content-alterar-endereco {
    background-color: #fff; 
    padding: 20px;
    border: 1px solid #888;
    width: 80%; 
    max-width: 500px;
    border-radius: 10px;
}

.modal-content-alterar-endereco h2 {
    margin-bottom: 15px
}

.close-alterar-endereco {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close-alterar-endereco:hover,
.close-alterar-endereco:focus {
    color: black;
    cursor: pointer;
}

.form-group-alterar-endereco {
    margin-bottom: 15px;
}

.form-group-alterar-endereco label {
    display: block;
    margin-bottom: 5px;
}

.form-group-alterar-endereco input {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
}

.btn-alterar-endereco {
    background-color: #FA511D;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    width: 100%;
}

.btn-alterar-endereco:hover {
    background-color: #FA511D;
}
</style>
