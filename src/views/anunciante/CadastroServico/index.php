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

    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

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

    <?php include '../layouts/Header.php'; ?>

    <section id="CadastroServico">
        <div>
            <a href="../PaginaInicial/" class="button voltar orange-back">Voltar</a>
        </div>
        <div class="flex-content">
            <form id="formCadastroServico" action="../../../controllers/anunciante/CreateService.php" method="POST">
                <div>
                    <label for="titulo">Título do Serviço:</label>
                    <input type="text" id="titulo" name="titulo" required>
                </div>
                <div>
                    <label for="descricao">Descrição:</label>
                    <textarea maxlength="5000" id="descricao" name="descricao" rows="4" required></textarea>
                    <p class="count">1000</p>
                </div>
                <div id="precoContainer">
                    <label for="preco">Preço:</label>
                    <input type="number" id="preco" name="preco" >
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
            <section class="info">
                <h2>Dicas para Criar um Bom Anúncio</h2>
                <ul>
                    <li><strong>Seja Claro e Conciso:</strong> Use uma linguagem simples e direta para que a mensagem seja facilmente compreendida.</li>
                    <li><strong>Destaque os Benefícios:</strong> Foque no que torna seu produto ou serviço especial e como ele pode resolver um problema.</li>
                    <li><strong>Inclua Informações Relevantes:</strong> Preço, localização e condições de pagamento devem estar claros.</li>
                    <li><strong>Crie um Título Atraente:</strong> Um bom título pode fazer toda a diferença. Seja criativo!</li>
                    <li><strong>Adicione Chamadas para Ação:</strong> Use frases como "Compre agora!" ou "Saiba mais!" para incentivar a ação.</li>
                    <li><strong>Utilize Provas Sociais:</strong> Comentários, avaliações e depoimentos de clientes podem aumentar a credibilidade do seu anúncio.</li>
                    <li><strong>Mantenha o Layout Organizado:</strong> Um design limpo e bem estruturado facilita a leitura e a compreensão da informação.</li>
                    <li><strong>Utilize Palavras-Chave:</strong> Inclua palavras-chave relevantes para que seu anúncio seja facilmente encontrado em buscas.</li>
                    <li><strong>Teste Diferentes Versões:</strong> Experimente variações no texto e design do anúncio para ver o que funciona melhor.</li>
                    <li><strong>Mantenha a Consistência de Marca:</strong> Use cores, fontes e estilos que reflitam a identidade da sua marca em todos os anúncios.</li>
                </ul>
            </section>
        </div>
    </section>

    <?php include '../layouts/Footer.php'; ?>

    <script>
        $(document).ready(function() {
            $('#formCadastroServico').on('submit', function(e) {
                e.preventDefault();

                // Obter o valor do campo comunitário
                var comunitario = $('#comunitario').val();
                var preco = $('#preco').val();

                $(".background-loading-50").removeClass("hidden");

                // Validação
                if (comunitario === "0" && !preco) {
                    $(".background-loading-50").addClass("hidden");
                    Swal.fire('Atenção!', 'O campo Preço é obrigatório quando o serviço não é comunitário.', 'warning');
                    return;
                }

                $.ajax({
                    type: "POST",
                    url: $(this).attr('action'),
                    data: $(this).serialize(),
                    success: function(response) {
                        $(".background-loading-50").addClass("hidden");
                        Swal.fire('Sucesso!', 'Serviço cadastrado com sucesso!', 'success');
                        location.href = '../PaginaInicial/';
                    },
                    error: function() {
                        $(".background-loading-50").addClass("hidden");
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

    <div class="background-loading-50 hidden">
        <div class="loading-icon"></div>
    </div>

</body>
</html>
