<?php

require_once __DIR__ . '/../../../../config/config.php';

// Função para criar a conexão com o banco de dados
function getDatabaseConnection() {
    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
    if ($conexao->connect_error) {
        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
    }
    
    return $conexao;
}

function getServicos($conexao, $limit, $offset) {
    $sql = "
        SELECT 
            s.id_servico, 
            s.titulo, 
            s.descricao, 
            s.preco, 
            s.aceita_oferta, 
            s.comunitario, 
            c.nome AS categoria_nome,
            s.data_Criacao,
            s.imagem,
            u.id_usuario
        FROM 
            servicos s
        INNER JOIN 
            categorias c ON s.id_categoria_fk = c.id_categoria
        INNER JOIN 
            usuarios u ON s.id_usuario_fk = u.id_usuario
        WHERE 
            s.ativo = 1 
            AND u.ativo = 1
    ";

    $params = [];
    $types = '';

    if (isset($_GET['busca'])) {
        $busca = htmlspecialchars($_GET['busca']);
        $sql .= " AND (s.titulo LIKE ? OR s.descricao LIKE ?)";
        $params[] = "%$busca%";
        $params[] = "%$busca%";
        $types .= 'ss';
    }

    if (isset($_GET['categoria'])) {
        $categoriaId = intval($_GET['categoria']);
        $sql .= " AND s.id_categoria_fk = ?";
        $params[] = $categoriaId;
        $types .= 'i';
    }

    if (isset($_GET['order'])) {
        $order = ($_GET['order'] === 'maiorpreco') ? 'DESC' : 'ASC';
        $sql .= " ORDER BY s.preco $order";
    } else {
        $sql .= " ORDER BY s.preco ASC";
    }

    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';

    $stmt = $conexao->prepare($sql);

    if ($stmt === false) {
        die('Erro na preparação da consulta: ' . $conexao->error);
    }

    $stmt->bind_param($types, ...$params);

    if (!$stmt->execute()) {
        die('Erro na execução da consulta: ' . $stmt->error);
    }

    $result = $stmt->get_result();

    if ($result) {
        return $result->fetch_all(MYSQLI_ASSOC);
    } else {
        return [];
    }
}

function getTotalServicos($conexao) {
    $sql = "
        SELECT COUNT(*) AS total 
        FROM servicos s
        INNER JOIN usuarios u ON s.id_usuario_fk = u.id_usuario
        WHERE s.ativo = 1
        AND u.ativo = 1
    ";

    $params = [];
    $types = '';

    if (isset($_GET['busca'])) {
        $busca = htmlspecialchars($_GET['busca']);
        $sql .= " AND (s.titulo LIKE ? OR s.descricao LIKE ?)";
        $params[] = "%$busca%";
        $params[] = "%$busca%";
        $types .= 'ss';
    }

    if (isset($_GET['categoria'])) {
        $categoriaId = intval($_GET['categoria']);
        $sql .= " AND s.id_categoria_fk = ?";
        $params[] = $categoriaId;
        $types .= 'i';
    }

    $stmt = $conexao->prepare($sql);

    if ($stmt === false) {
        die('Erro na preparação da consulta: ' . $conexao->error);
    }

    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    if ($result) {
        $row = $result->fetch_assoc();
        return $row['total'];
    } else {
        return 0;
    }
}

function GetCategoriasServicos ($conn) {
    $sql = "SELECT * FROM categorias ORDER BY ordenacao ASC;";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

?>

<!DOCTYPE html>
<html lang="pt-br">
<head>

    <!-- Título da Página - SEO -->
    <title>Listagem de Serviços | Trabalho Amigo</title>
    <!-- Descrição da Página - SEO -->
    <meta name="description" content="Explore nossa listagem de serviços disponíveis e encontre freelancers qualificados para atender suas necessidades. Comece a contratar hoje mesmo!" />

    <!-- Metas tags de configurações das páginas -->
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>

    <!-- Importação do Icone do Projeto -->
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">

    <!-- Tags Globais do projeto -->
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">

    <!-- Tags Especificas de cada página-->
    <link rel="stylesheet" href="../../../../public/css/contrante/ListagemServico.css">

    <script src="../../../../public/js/contratante/Listagem.js" defer></script>

    <!-- Importação da bibliotecas -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://unpkg.com/swiper/swiper-bundle.min.css" />
    <script src="https://unpkg.com/swiper/swiper-bundle.min.js" defer></script>

    <body>

        <script>
            $.ajax({
                url: `../../../controllers/contratante/Security.php`,
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
        
        <!-- ================================================================================== -->
        <main id="content">
            <section id="bloco-busca">
                <div class="row">
                    <form method="get" action="#" class="input-box">
                        <input value="<?php echo htmlspecialchars($_GET['busca'] ?? ''); ?>" type="text" name="busca" id="busca" placeholder="Pesquisa por serviços" class="input_element">
                        <button type="submit" class="button_busca">Buscar</button>
                    </form>
                </div>
                <div class="row">
                    <h2 id="qtdServicos" class="resultado">
                       <strong> <?php echo getTotalServicos(getDatabaseConnection()); ?></strong> Serviços encontrados!
                    </h2>
                    <div class="d-flex">
                        <div class="ordenar">
                            <h2 class="titulo">Ordenar por</h2>
                            <select class="selectOrdenacao" name="ordenar" id="ordenar_select">
                                <option class="optionSelectOrdenacao" value="menorpreco">Menor Preço</option>
                                <option class="optionSelectOrdenacao" value="maiorpreco">Maior preço</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
            <div id="filterContainer" class="filtros-box">
                <h3 class="titulo-box">FILTROS:</h3>
                <div class="swiper-container">
                    <div class="swiper-wrapper">
                        <?php foreach (GetCategoriasServicos(getDatabaseConnection()) as $categoria): ?>
                            <div class="swiper-slide filtro-item" data-id="<?php echo htmlspecialchars($categoria['id_categoria']); ?>">
                                <h1 class="titulo"><?php echo htmlspecialchars($categoria['nome']); ?></h1>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            <section id="bloco-servico">
                </div>
                <div id="listServicos" class="servicos">
                    <?php
                        // Função para renderizar os serviços
                        function renderServicos($servicos) {
                            if (empty($servicos)) {
                                echo "<p>Nenhum serviço encontrado.</p>";
                                return;
                            }

                            echo '<ul class="listagem-servico">';
                            foreach ($servicos as $servico) {
                                echo '<li class="listagem-item">';
                                echo '<div class="item-conteudo">';
                                if (!empty($servico['imagem']) && $servico['imagem'] !== 'null') {
                                    $imagemUrl = '../../../../public/uploads/servicos/' . htmlspecialchars($servico['imagem']);
                                    echo '<img class="listagem-imagem" src="' . $imagemUrl . '" alt="' . htmlspecialchars($servico['titulo']) . '" />';
                                } else {
                                    $imagemUrl = '../../../../public/uploads/servicos/default-image.png'; // imagem padrão caso não haja uma imagem
                                    echo '<img class="listagem-imagem" src="' . $imagemUrl . '" alt="Imagem não disponível" />';
                                }
                                echo '<h2 class="listagem-titulo">' . htmlspecialchars($servico['titulo']) . '</h2>';
                                echo '<p class="listagem-descricao">Descrição: ' . htmlspecialchars($servico['descricao']) . '</p>';
                                echo '<p class="listagem-preco">' . ($servico['preco'] == 0 ? 'Comunitário' : 'Preço: R$ ' . number_format($servico['preco'], 2, ',', '.')) . '</p>';
                                echo '<p class="listagem-categoria">Categoria: ' . htmlspecialchars($servico['categoria_nome']) . '</p>';
                                echo '<p class="listagem-data">Data de Criação: ' . date('d/m/Y H:i:s', strtotime($servico['data_Criacao'])) . '</p>';
                                echo '<p class="listagem-oferta">Aceita Oferta: ' . ($servico['aceita_oferta'] ? 'Sim' : 'Não') . '</p>';
                                echo '<p class="listagem-comunitario">Comunitário: ' . ($servico['comunitario'] ? 'Sim' : 'Não') . '</p>';
                                echo '<button class="btn-modal" onclick="openModal(' . $servico['id_servico'] . ', \'' . addslashes(htmlspecialchars($servico['titulo'])) . '\', \'' . addslashes(htmlspecialchars($servico['descricao'])) . '\', ' . $servico['preco'] . ', \'' . addslashes($imagemUrl) . '\')">Fazer proposta</button>';
                                echo '</div>';
                                echo '</li>';
                            }
                            echo '</ul>';

                            echo '
                                <div id="modal" class="modal" style="display:none;">
                                    <div class="modal-content">
                                        <span class="close" onclick="closeModal()">&times;</span>
                                        <div class="content-container">
                                            <img id="modal-imagem" src="" alt="" style="max-width: 100%; height: auto; margin-bottom: 15px;" />
                                            <h2 id="modal-titulo"></h2>
                                            <p id="modal-descricao"></p>
                                            <p id="modal-preco"></p>
                                        </div>
                                        <a id="contratar-btn" class="btn-contratar" href="#" onclick="contratarServico()">Deseja contratar esse serviço?</a>
                                    </div>
                                </div>
                            ';
                        }

                        function renderPagination($currentPage, $totalPages, $busca = null) {
                            echo '<div class="pagination">';
                        
                            // Botão "anterior"
                            if ($currentPage > 1) {
                                $prevPage = $currentPage - 1;
                                echo '<a href="?page=' . $prevPage . ($busca ? '&busca=' . urlencode($busca) : '') . '">&laquo; Anterior</a>';
                            }
                        
                            // Números de página
                            for ($i = 1; $i <= $totalPages; $i++) {
                                echo '<a href="?page=' . $i . ($busca ? '&busca=' . urlencode($busca) : '') . '" ' . ($i == $currentPage ? 'class="active"' : '') . '>' . $i . '</a>';
                            }
                        
                            // Botão "próxima"
                            if ($currentPage < $totalPages) {
                                $nextPage = $currentPage + 1;
                                echo '<a href="?page=' . $nextPage . ($busca ? '&busca=' . urlencode($busca) : '') . '">Próxima &raquo;</a>';
                            }
                        
                            echo '</div>';
                        }

                        // Processa a listagem de serviços com paginação
                        function processListServicos() {
                            try {
                                $conexao = getDatabaseConnection();

                                // Parâmetros de paginação
                                $limit = 8; // Serviços por página
                                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;  // Página atual, padrão 1
                                $offset = ($page - 1) * $limit;  // Cálculo de offset

                                // Obter total de serviços e calcular o número total de páginas
                                $totalServicos = getTotalServicos($conexao);
                                $totalPages = ceil($totalServicos / $limit);

                                // Buscar os serviços da página atual
                                $servicos = getServicos($conexao, $limit, $offset);

                                $busca = isset($_GET['busca']) ? htmlspecialchars($_GET['busca']) : '';

                                // Renderizar os serviços e a paginação
                                renderServicos($servicos);
                                renderPagination($page, $totalPages, $busca);

                                $conexao->close();
                            } catch (Exception $e) {
                                echo "<p>Erro: " . $e->getMessage() . "</p>";
                            }
                        }

                        // Processar a listagem de serviços
                        processListServicos();
                    ?>
                </div>
            </section>
        </main>
        <!-- ================================================================================== -->

        <?= include '../layouts/Footer.php'; ?>

    </body>
</html>