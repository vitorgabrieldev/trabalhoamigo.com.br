<?php

function getServicos($conexao, $limit, $offset, $categoriaId = null, $busca = null) {
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
    ";

    // Adicionar filtros
    $params = [];
    
    if ($categoriaId !== null) {
        $sql .= " AND s.id_categoria_fk = ?";
        $params[] = $categoriaId;
    }

    if ($busca !== null && $busca !== '') {
        $sql .= " AND s.titulo LIKE ?";
        $params[] = '%' . $busca . '%'; // Para busca parcial
    }

    $sql .= " ORDER BY s.data_Criacao DESC
              LIMIT ? OFFSET ?";

    // Preparar a consulta
    $stmt = $conexao->prepare($sql);

    // Verificar se a preparação falhou
    if ($stmt === false) {
        die('Erro na preparação da consulta: ' . $conexao->error);
    }

    // Associar os parâmetros
    $params[] = $limit;
    $params[] = $offset;

    // Criar um tipo de parâmetro para cada valor
    $paramTypes = str_repeat('i', count($params) - 2); // 'i' para inteiros
    if (isset($params[count($params) - 2])) {
        $paramTypes .= 'ii'; // Para o limite e offset
    }
    
    // Bind dos parâmetros
    $stmt->bind_param($paramTypes, ...$params);

    // Executar a consulta
    if (!$stmt->execute()) {
        die('Erro na execução da consulta: ' . $stmt->error);
    }

    // Obter os resultados
    $result = $stmt->get_result();

    // Retornar os dados ou um array vazio se não houver resultados
    return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
}

?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <title>Listagem de Serviços | Trabalho Amigo</title>
    <meta name="description" content="Explore nossa listagem de serviços disponíveis e encontre freelancers qualificados para atender suas necessidades. Comece a contratar hoje mesmo!" />
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1'>
    <link rel="icon" href="../../favicon.ico" type="image/x-icon">
    <script src="../../../../app.js" defer></script>
    <link rel="stylesheet" href="../../../../app.css">
    <link rel="stylesheet" href="../../../../public/css/contrante/ListagemServico.css">
    <script src="../../../../public/js/contratante/Listagem.js" defer></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>

<script>
    $.ajax({
        url: `../../../controllers/contratante/Security.php`,
        method: 'GET',
        success: function (data) {
            if (data == 'false') {
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

<main id="content">
    <section id="bloco-servico">
        <div id="filterContainer" class="filtros-box hidden">
            <h3 class="titulo-box">FILTROS:</h3>
            <div class="filtro-item">
                <h1 class="titulo">Saúde</h1>
            </div>
        </div>
        <div id="listServicos" class="servicos">
            <?php
                require_once __DIR__ . '/../../../../config/config.php';

                function getDatabaseConnection() {
                    $conexao = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
                    if ($conexao->connect_error) {
                        throw new Exception('Falha na conexão com o banco de dados: ' . $conexao->connect_error);
                    }
                    return $conexao;
                }

                function getTotalServicos($conexao, $categoriaId = null, $busca = null) {
                    $sql = "SELECT COUNT(*) AS total FROM servicos s INNER JOIN usuarios u ON s.id_usuario_fk = u.id_usuario WHERE s.ativo = 1 AND u.ativo = 1";
                    
                    // Adicionar filtros
                    if ($categoriaId !== null) {
                        $sql .= " AND s.id_categoria_fk = ?";
                    }
                    if ($busca !== null && $busca !== '') {
                        $sql .= " AND s.titulo LIKE ?";
                    }
                    
                    // Preparar a consulta
                    $stmt = $conexao->prepare($sql);
                    
                    // Variáveis para armazenar parâmetros
                    $params = [];
                    
                    if ($categoriaId !== null) {
                        $params[] = $categoriaId;
                    }
                    if ($busca !== null && $busca !== '') {
                        $params[] = '%' . $busca . '%';
                    }
                
                    // Montar os tipos de parâmetros
                    $paramTypes = '';
                    if ($categoriaId !== null) {
                        $paramTypes .= 'i'; // Inteiro para categoria
                    }
                    if ($busca !== null && $busca !== '') {
                        $paramTypes .= 's'; // String para busca
                    }
                
                    // Associar os parâmetros
                    if ($paramTypes) {
                        $stmt->bind_param($paramTypes, ...$params);
                    }
                    
                    // Executar a consulta
                    if (!$stmt->execute()) {
                        die('Erro na execução da consulta: ' . $stmt->error);
                    }
                    
                    // Obter os resultados
                    $result = $stmt->get_result();
                    
                    // Retornar total
                    return $result->fetch_assoc()['total'];
                }
                

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
                            $imagemUrl = '../../../../public/uploads/servicos/default-image.png';
                            echo '<img class="listagem-imagem" src="' . $imagemUrl . '" alt="Imagem não disponível" />';
                        }
                        echo '<h2 class="listagem-titulo">' . htmlspecialchars($servico['titulo']) . '</h2>';
                        echo '<p class="listagem-descricao">Descrição: ' . htmlspecialchars($servico['descricao']) . '</p>';
                        echo '<p class="listagem-preco">' . ($servico['preco'] == 0 ? 'Comunitário' : 'Preço: R$ ' . number_format($servico['preco'], 2, ',', '.')) . '</p>';
                        echo '<p class="listagem-categoria">Categoria: ' . htmlspecialchars($servico['categoria_nome']) . '</p>';
                        echo '<p class="listagem-data">Data de Criação: ' . date('d/m/Y H:i:s', strtotime($servico['data_Criacao'])) . '</p>';
                        echo '<p class="listagem-oferta">Aceita Oferta: ' . ($servico['aceita_oferta'] ? 'Sim' : 'Não') . '</p>';
                        echo '<p class="listagem-comunitario">Comunitário: ' . ($servico['comunitario'] ? 'Sim' : 'Não') . '</p>';
                        echo '</div>';
                        echo '</li>';
                    }
                    echo '</ul>';
                }

                // Início da lógica de paginação
                $limit = 10; // Limite de serviços por página
                $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
                $offset = ($pagina - 1) * $limit;

                $busca = isset($_GET['busca']) ? trim($_GET['busca']) : null;
                $categoriaId = isset($_GET['categoria']) ? (int)$_GET['categoria'] : null;

                // Conexão ao banco de dados
                $conexao = getDatabaseConnection();

                // Obter serviços
                $servicos = getServicos($conexao, $limit, $offset, $categoriaId, $busca);

                // Renderizar serviços
                renderServicos($servicos);

                // Obter total de serviços
                $totalServicos = getTotalServicos($conexao, $categoriaId, $busca);
                $totalPaginas = ceil($totalServicos / $limit);
                
                // Renderizar navegação
                echo '<div class="navegacao">';
                if ($pagina > 1) {
                    echo '<a href="?pagina=' . ($pagina - 1) . '&busca=' . urlencode($busca) . '&categoria=' . $categoriaId . '">Anterior</a>';
                }
                if ($pagina < $totalPaginas) {
                    echo '<a href="?pagina=' . ($pagina + 1) . '&busca=' . urlencode($busca) . '&categoria=' . $categoriaId . '">Próximo</a>';
                }
                echo '</div>';
            ?>
        </div>
    </section>
</main>

<?php include '../layouts/Footer.php'; ?>

</body>
</html>
