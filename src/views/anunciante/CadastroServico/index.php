<?php
session_start();

require_once __DIR__ . '/../../../../config/config.php';

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
            <form enctype="multipart/form-data" id="formCadastroServico" action="../../../controllers/anunciante/CreateService.php" method="POST">
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

    <section class="uploads-avancado">
        <h1 class="titulo-upload-avancado">Mostre para seus clientes uma imagem do seu serviço</h1>
        <div class="container-upload">
            <label for="arquivo" class="custom-file-upload">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-cloud-arrow-up-fill" viewBox="0 0 16 16">
                    <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z"/>
                </svg>
                Selecionar Arquivo
            </label>
            <span id="fileName" class="name-file">Nenhum arquivo selecionado
                <span class="delete-trash" style="display: none;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                </span>
            </span>
            <input type="file" id="arquivo" name="arquivo" class="input-file" accept="image/*" style="display: none;"/>
        </div>
    </section>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        $(document).ready(function() {
            // Ao clicar no contêiner, abre a seleção de arquivos
            $('.container-upload').on('click', function(event) {
                // Previne que o clique no label dispare outro clique no input
                event.stopPropagation();
                $('#arquivo').click();
            });

            // Evento para mostrar o nome do arquivo selecionado
            $('#arquivo').on('change', function(event) {
                const file = event.target.files[0];
                const fileName = file ? file.name : 'Nenhum arquivo selecionado';
                $('#fileName').text(fileName);

                // Mostrar o ícone da lixeira se um arquivo foi selecionado
                if (file) {
                    $('.delete-trash').show();
                } else {
                    $('.delete-trash').hide();
                }
            });

            // Evento para remover a imagem selecionada
            $('.delete-trash').on('click', function() {
                // Limpa o input de arquivo
                $('#arquivo').val('');
                $('#fileName').text('Nenhum arquivo selecionado');
                // Oculta o ícone da lixeira
                $(this).hide();
            });
        });
    </script>



    <?php include '../layouts/Footer.php'; ?>

    <script>
        $(document).ready(function() {
            $('#formCadastroServico').on('submit', function(e) {
            e.preventDefault();

            // Obter o valor do campo comunitário e preço
            var comunitario = $('#comunitario').val();
            var preco = $('#preco').val();

            // Remover a classe de ocultação para mostrar o carregamento
            $(".background-loading-50").removeClass("hidden");

            // Validação
            if (comunitario === "0" && !preco) {
                $(".background-loading-50").addClass("hidden");
                Swal.fire('Atenção!', 'O campo Preço é obrigatório quando o serviço não é comunitário.', 'warning');
                return;
            }

            // Criar um objeto FormData
            var formData = new FormData(this);

            var arquivoInput = document.getElementById('arquivo');
            if (arquivoInput.files.length > 0) {
                formData.append('arquivo', arquivoInput.files[0]);
            };

            $.ajax({
                type: "POST",
                url: $(this).attr('action'),
                data: formData,
                processData: false, 
                contentType: false,
                success: function(response) {
                    $(".background-loading-50").addClass("hidden");
                    var jsonResponse = JSON.parse(response);

                    // Verificar o status da resposta
                    if (jsonResponse.status === 'success') {
                        Swal.fire('Sucesso!', jsonResponse.message, 'success');
                        location.href = '../PaginaInicial/';
                    } else {
                        Swal.fire('Erro!', jsonResponse.message, 'error');
                    }
                },
                error: function(xhr, status, error) {
                    $(".background-loading-50").addClass("hidden");
                    Swal.fire('Erro!', 'Houve um problema ao cadastrar o serviço: ' + error, 'error');
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
