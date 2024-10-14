<?php
session_start();

// Conexão com o banco de dados
define('DB_SERVER', '185.173.111.184');
define('DB_USERNAME', 'u858577505_trabalhoamigo');
define('DB_PASSWORD', '@#Trabalhoamigo023@_');
define('DB_NAME', 'u858577505_trabalhoamigo');

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Consulta para obter as categorias
$sql = "SELECT id_categoria, nome, descricao FROM categorias ORDER BY ordenacao";
$result = $conn->query($sql);

$categorias = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }
}
?>


<!DOCTYPE html>
<html lang="pt-br">
<head>
    <!-- Título da Página - SEO -->
    <title>Crie sua Conta Gratuitamente | Trabalho Amigo</title>
    <meta name="description" content="Crie sua Conta">

    <!-- Metas tags de configurações das páginas -->
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>

    <!-- Importação do Icone do Projeto -->
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">

    <!-- Tags Globais do projeto -->
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">

    <!-- Tags Especificas de cada página -->
    <link rel="stylesheet" href="../../../../public/css/anunciante/CadastroServico.css">

    <!-- Importação das bibliotecas -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>

<body>

    <script>
        $.ajax({
            url: `../../../controllers/anunciante/Security.php`,
            method: 'GET',
            success: function (data) {
                if (data == 'true') {
                } else if (data == 'false') {
                    window.location.href = "../CriarConta/";
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro',
                    text: 'Erro na Autenticação.'
                });
            }
        });
    </script>

    <section id="CadastroServico">
        <div>
            <a href="../PaginaInicial/" class="button voltar">Voltar</a>
        </div>
        <form id="formCadastroServico" action="../../../controllers/anunciante/CreateService.php" method="POST">
            <div>
                <label for="titulo">Título do Serviço:</label>
                <input type="text" id="titulo" name="titulo" required>
            </div>
            <div>
                <label for="descricao">Descrição:</label>
                <textarea id="descricao" name="descricao" rows="4" required></textarea>
            </div>
            <div id="precoContainer">
                <label for="preco">Preço:</label>
                <input type="number" id="preco" name="preco" step="0.01">
            </div>
            <div id="aceitaOferta">
                <label for="aceita_oferta">Aceita Oferta:</label>
                <select id="aceita_oferta" name="aceita_oferta">
                    <option value="1">Sim</option>
                    <option value="0">Não</option>
                </select>
            </div>
            <div>
                <label for="comunitario">Comunitário:</label>
                <select id="comunitario" name="comunitario" required>
                    <option value="0">Não</option>
                    <option value="1">Sim</option>
                </select>
            </div>
            <div>
                <label for="id_categoria_fk">Categoria:</label>
                <select id="id_categoria_fk" name="id_categoria_fk" required>
                    <option value="">Selecione uma categoria</option>
                    <?php foreach ($categorias as $categoria): ?>
                        <option value="<?= $categoria['id_categoria'] ?>"><?= htmlspecialchars($categoria['nome']) ?> - <?= htmlspecialchars($categoria['descricao']) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div>
                <button type="submit">Cadastrar Serviço</button>
            </div>
        </form>
    </section>

    <script>
        $(document).ready(function() {
            $('#formCadastroServico').on('submit', function(e) {
                e.preventDefault();

                // Obter o valor do campo comunitário
                var comunitario = $('#comunitario').val();
                var preco = $('#preco').val();

                // Validação
                if (comunitario === "0" && !preco) {
                    Swal.fire('Atenção!', 'O campo Preço é obrigatório quando o serviço não é comunitário.', 'warning');
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: $(this).attr('action'),
                    data: $(this).serialize(),
                    success: function(response) {
                        console.log(response);
                        Swal.fire('Sucesso!', 'Serviço cadastrado com sucesso!', 'success');
                        location.href = '../PaginaInicial/';
                    },
                    error: function() {
                        Swal.fire('Erro!', 'Houve um problema ao cadastrar o serviço.', 'error');
                    }
                });
            });

            $('#comunitario').on('change', function() {
                var valor = $(this).val();
                var precoField = $('#precoContainer');
                var aceita_oferta = $('#aceitaOferta');

                if (valor === "1") {
                    precoField.hide();
                    aceita_oferta.hide();
                    $('#preco').val(''); // Limpa o campo de preço
                } else {
                    precoField.show();
                    aceita_oferta.show();
                }
            });
        });
    </script>

    <style>
        /* Estilo do botão de voltar */
        .button.voltar {
            display: inline-block;
            padding: 10px 20px;
            margin-bottom: 20px;
            background-color: #007bff; /* Cor azul */
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.3s;
        }

        .button.voltar:hover {
            background-color: #0056b3; /* Azul mais escuro ao passar o mouse */
        }
    </style>
</body>
</html>
